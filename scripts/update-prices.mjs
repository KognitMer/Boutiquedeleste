import { readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const BRL_TO_UYU_RATE = 10;
const CONCURRENCY = 5;
const MAX_ATTEMPTS = 3;
const REQUEST_TIMEOUT_MS = 20_000;
const REQUEST_GAP_MS = 400;
const RATE_LIMIT_COOLDOWN_MS = 45_000;
const MIN_SUCCESS_RATIO = 0.85;
const DRY_RUN = process.argv.includes('--dry-run');
const limitArgument = process.argv.find((argument) =>
  argument.startsWith('--limit='),
);
const requestedLimit = limitArgument
  ? Number(limitArgument.split('=')[1])
  : undefined;

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectDirectory = path.resolve(scriptDirectory, '..');
const catalogPath = path.join(projectDirectory, 'app', 'catalog-data.ts');

const delay = (milliseconds) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));
let nextRequestAt = 0;
let cooldownUntil = 0;
let requestGate = Promise.resolve();

function waitForRequestSlot() {
  const scheduled = requestGate.then(async () => {
    const now = Date.now();
    const waitUntil = Math.max(nextRequestAt, cooldownUntil);
    if (waitUntil > now) await delay(waitUntil - now);
    nextRequestAt = Date.now() + REQUEST_GAP_MS;
  });

  requestGate = scheduled.catch(() => {});
  return scheduled;
}

function parseCatalog(source) {
  const marker = 'export const products: Product[] = ';
  const markerIndex = source.indexOf(marker);

  if (markerIndex === -1) {
    throw new Error(
      'No se encontró la lista de productos en app/catalog-data.ts.',
    );
  }

  const arrayStart = source.indexOf('[', markerIndex + marker.length);
  const arrayEnd = source.lastIndexOf('];');

  if (arrayStart === -1 || arrayEnd === -1 || arrayEnd <= arrayStart) {
    throw new Error('No se pudo leer la lista de productos.');
  }

  return JSON.parse(source.slice(arrayStart, arrayEnd + 1));
}

function findProductSchema(value, sku) {
  if (Array.isArray(value)) {
    for (const item of value) {
      const match = findProductSchema(item, sku);
      if (match) return match;
    }
    return null;
  }

  if (!value || typeof value !== 'object') return null;

  const type = value['@type'];
  const schemaSku = String(value.sku ?? '').replace(/^NATBRA-/i, '');
  if (
    (type === 'Product' || (Array.isArray(type) && type.includes('Product'))) &&
    schemaSku === sku
  ) {
    return value;
  }

  for (const nested of Object.values(value)) {
    const match = findProductSchema(nested, sku);
    if (match) return match;
  }

  return null;
}

function isNormalPriceSpecification(specification) {
  const priceType = String(
    specification?.priceType ?? specification?.name ?? '',
  ).toLowerCase();

  return [
    'listprice',
    'list price',
    'regularprice',
    'regular price',
    'originalprice',
    'original price',
    'fullprice',
    'full price',
    'msrp',
    'suggestedretailprice',
    'suggested retail price',
    'preço regular',
    'preco regular',
    'preço de lista',
    'preco de lista',
  ].some((type) => priceType.includes(type));
}

function getSpecificationPrice(specification) {
  const price = Number(
    specification?.price ?? specification?.minPrice ?? specification?.value,
  );

  return Number.isFinite(price) && price > 0 && price < 10_000 ? price : null;
}

function extractPrice(html, sku) {
  const scripts = html.matchAll(
    /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
  );

  for (const match of scripts) {
    try {
      const schema = findProductSchema(JSON.parse(match[1]), sku);
      if (!schema) continue;

      const offers = Array.isArray(schema.offers)
        ? schema.offers
        : [schema.offers];

      const specifications = [
        schema.priceSpecification,
        ...offers.map((offer) => offer?.priceSpecification),
      ].flatMap((value) => (Array.isArray(value) ? value : [value]));

      for (const specification of specifications) {
        const normalPrice = isNormalPriceSpecification(specification)
          ? specification
          : null;
        const price = getSpecificationPrice(normalPrice);
        if (price !== null) return price;
      }

      for (const offer of offers) {
        const price = Number(offer?.price ?? offer?.lowPrice);
        if (Number.isFinite(price) && price > 0 && price < 10_000) return price;
      }
    } catch {
      // Algunas fichas incluyen otros bloques JSON-LD; se ignoran si son inválidos.
    }
  }

  throw new Error('la ficha no publicó un precio válido');
}

async function fetchBrazilPrice(sku) {
  const url = `https://www.natura.com.br/p/x/NATBRA-${encodeURIComponent(sku)}`;
  let lastError;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    try {
      await waitForRequestSlot();
      const response = await fetch(url, {
        redirect: 'follow',
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        headers: {
          accept: 'text/html,application/xhtml+xml',
          'accept-language': 'pt-BR,pt;q=0.9',
          'user-agent':
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36',
        },
      });

      if (!response.ok) {
        const error = new Error(`HTTP ${response.status}`);
        error.status = response.status;
        throw error;
      }
      return extractPrice(await response.text(), sku);
    } catch (error) {
      lastError = error;
      if (error?.status === 404) break;

      if (error?.status === 403 || error?.status === 429) {
        cooldownUntil = Math.max(
          cooldownUntil,
          Date.now() + RATE_LIMIT_COOLDOWN_MS * attempt,
        );
      }

      if (attempt < MAX_ATTEMPTS) await delay(attempt * 2_000);
    }
  }

  throw lastError;
}

async function mapConcurrent(items, worker) {
  const results = new Array(items.length);
  let nextIndex = 0;

  async function runWorker() {
    while (nextIndex < items.length) {
      const index = nextIndex;
      nextIndex += 1;
      results[index] = await worker(items[index], index);
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(CONCURRENCY, items.length) }, runWorker),
  );
  return results;
}

function replaceProductPrice(source, product, newPrice) {
  const pattern = new RegExp(
    `(\\{\\s*"id":\\s*${product.id},\\s*"sku":\\s*"${product.sku}"[\\s\\S]*?"price":\\s*)\\d+`,
  );
  const updated = source.replace(pattern, `$1${newPrice}`);

  if (updated === source && product.price !== newPrice) {
    throw new Error(`No se pudo actualizar el precio del SKU ${product.sku}.`);
  }

  return updated;
}

function replaceCatalogTimestamp(source, timestamp) {
  const pattern = /export const catalogLastUpdatedAt = "[^"]+";/;
  const updated = source.replace(
    pattern,
    `export const catalogLastUpdatedAt = "${timestamp}";`,
  );

  if (updated === source) {
    throw new Error('No se pudo actualizar la fecha del catalogo.');
  }

  return updated;
}

const source = await readFile(catalogPath, 'utf8');
const fullCatalog = parseCatalog(source);
const products =
  Number.isInteger(requestedLimit) && requestedLimit > 0
    ? fullCatalog.slice(0, requestedLimit)
    : fullCatalog;
console.log(`Consultando ${products.length} productos en Natura Brasil...`);

let completed = 0;
const results = await mapConcurrent(products, async (product) => {
  try {
    const brlPrice = await fetchBrazilPrice(product.sku);
    const uyuPrice = Math.round(brlPrice * BRL_TO_UYU_RATE);
    return { product, brlPrice, uyuPrice };
  } catch (error) {
    return {
      product,
      error: error instanceof Error ? error.message : String(error),
    };
  } finally {
    completed += 1;
    if (completed % 50 === 0 || completed === products.length) {
      console.log(`Progreso: ${completed}/${products.length}`);
    }
  }
});

const successful = results.filter((result) => !result.error);
const failed = results.filter((result) => result.error);
const successRatio = successful.length / products.length;

if (successRatio < MIN_SUCCESS_RATIO) {
  console.error(
    `Actualización cancelada: solo respondieron ${successful.length}/${products.length} fichas.`,
  );
  for (const result of failed.slice(0, 20)) {
    console.error(`- SKU ${result.product.sku}: ${result.error}`);
  }
  process.exitCode = 1;
} else {
  const changed = successful.filter(
    ({ product, uyuPrice }) => product.price !== uyuPrice,
  );
  let updatedSource = source;

  for (const { product, uyuPrice } of changed) {
    updatedSource = replaceProductPrice(updatedSource, product, uyuPrice);
  }

  if (!DRY_RUN && !requestedLimit) {
    updatedSource = replaceCatalogTimestamp(
      updatedSource,
      new Date().toISOString(),
    );
  }

  console.log(
    `Fichas leídas: ${successful.length}/${products.length}. Cambios de precio: ${changed.length}.`,
  );
  console.log(`Conversión aplicada: 1 BRL = ${BRL_TO_UYU_RATE} UYU.`);

  for (const { product, brlPrice, uyuPrice } of changed.slice(0, 25)) {
    console.log(
      `- SKU ${product.sku}: R$ ${brlPrice.toFixed(2)} → $U ${uyuPrice} (antes $U ${product.price})`,
    );
  }
  if (changed.length > 25)
    console.log(`... y ${changed.length - 25} cambios más.`);

  if (failed.length > 0) {
    console.warn(
      `${failed.length} fichas no respondieron; conservarán su precio anterior.`,
    );
    for (const result of failed.slice(0, 20)) {
      console.warn(`- SKU ${result.product.sku}: ${result.error}`);
    }
  }

  if (DRY_RUN) {
    console.log('Simulación finalizada: no se modificó el catálogo.');
  } else if (updatedSource === source) {
    console.log('El catálogo ya estaba actualizado.');
  } else {
    const temporaryPath = `${catalogPath}.tmp`;
    await writeFile(temporaryPath, updatedSource, 'utf8');
    await rename(temporaryPath, catalogPath);
    console.log('Catálogo actualizado correctamente.');
  }
}
