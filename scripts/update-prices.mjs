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
const AUDIT = process.argv.includes('--audit');
const limitArgument = process.argv.find((argument) =>
  argument.startsWith('--limit='),
);
const skuArgument = process.argv.find((argument) =>
  argument.startsWith('--sku='),
);
const requestedLimit = limitArgument
  ? Number(limitArgument.split('=')[1])
  : undefined;
const requestedSku = skuArgument ? skuArgument.split('=')[1] : undefined;

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

function findProductData(value, sku) {
  if (Array.isArray(value)) {
    for (const item of value) {
      const match = findProductData(item, sku);
      if (match) return match;
    }
    return null;
  }

  if (!value || typeof value !== 'object') return null;
  if (String(value.sku ?? '').replace(/^NATBRA-/i, '') === sku) return value;

  for (const nested of Object.values(value)) {
    const match = findProductData(nested, sku);
    if (match) return match;
  }

  return null;
}

function collectPriceCandidates(value, candidates = []) {
  if (Array.isArray(value)) {
    for (const item of value) {
      collectPriceCandidates(item, candidates);
    }
    return candidates;
  }

  if (!value || typeof value !== 'object') return candidates;

  const priceKeys = [
    'price',
    'lowPrice',
    'highPrice',
    'minPrice',
    'maxPrice',
    'listPrice',
    'regularPrice',
    'originalPrice',
    'fullPrice',
    'compareAtPrice',
  ];
  for (const key of priceKeys) {
    const price = getSpecificationPrice(value[key]);
    if (price !== null) candidates.push({ price, key });
  }

  for (const nested of Object.values(value)) {
    collectPriceCandidates(nested, candidates);
  }

  return candidates;
}

function getSpecificationPrice(specification) {
  const price = Number(
    typeof specification === 'object'
      ? (specification.price ?? specification.minPrice ?? specification.value)
      : specification,
  );

  return Number.isFinite(price) && price > 0 && price < 10_000 ? price : null;
}

function extractPrice(html, sku) {
  const scripts = html.matchAll(
    /<script[^>]*>([\s\S]*?)<\/script>/gi,
  );

  const candidates = [];

  for (const match of scripts) {
    try {
      const parsed = JSON.parse(match[1]);
      const schema = findProductSchema(parsed, sku);
      const productData = schema ?? findProductData(parsed, sku);
      if (!productData) continue;

      collectPriceCandidates(productData, candidates);
    } catch {
      // Algunas fichas incluyen otros bloques JSON-LD; se ignoran si son inválidos.
    }
  }

  if (candidates.length > 0) {
    const highestPrice = Math.max(...candidates.map(({ price }) => price));
    return {
      price: highestPrice,
      source:
        candidates.length === 1 && candidates[0].key === 'price'
          ? 'single-price-unverified'
          : 'highest-published-price',
      candidateCount: candidates.length,
      candidates,
    };
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
  const results = Array.from({ length: items.length });
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
  requestedSku
    ? fullCatalog.filter((product) => product.sku === requestedSku)
    : Number.isInteger(requestedLimit) && requestedLimit > 0
    ? fullCatalog.slice(0, requestedLimit)
    : fullCatalog;
if (requestedSku && products.length === 0) {
  throw new Error(`No se encontró el SKU ${requestedSku} en el catálogo.`);
}
console.log(`Consultando ${products.length} productos en Natura Brasil...`);

let completed = 0;
const results = await mapConcurrent(products, async (product) => {
  try {
    const brlPrice = await fetchBrazilPrice(product.sku);
    const uyuPrice = Math.round(brlPrice.price * BRL_TO_UYU_RATE);
    return {
      product,
      brlPrice: brlPrice.price,
      priceSource: brlPrice.source,
      priceCandidates: brlPrice.candidateCount,
      candidates: brlPrice.candidates,
      uyuPrice,
    };
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

if (AUDIT) {
  console.log('\nAuditoría de fuentes de precio:');
  for (const result of successful) {
    console.log(
      `${result.priceSource === 'single-price-unverified' ? 'REVISAR' : 'OK'} | SKU ${result.product.sku} | ${result.product.name} | fuente: ${result.priceSource} | candidatos: ${result.priceCandidates} | $U ${result.uyuPrice}`,
    );
    if (requestedSku) {
      console.log(`  Valores: ${result.candidates.map(({ key, price }) => `${key}=${price}`).join(', ')}`);
    }
  }
  for (const result of failed) {
    console.log(`ERROR | SKU ${result.product.sku} | ${result.product.name} | ${result.error}`);
  }
  console.log(
    `\nResultado: ${successful.filter((result) => result.priceSource === 'highest-published-price').length} con máximo verificable, ${successful.filter((result) => result.priceSource === 'single-price-unverified').length} para revisión manual y ${failed.length} con error.`,
  );
}

if (!AUDIT && successRatio < MIN_SUCCESS_RATIO) {
  console.error(
    `Actualización cancelada: solo respondieron ${successful.length}/${products.length} fichas.`,
  );
  for (const result of failed.slice(0, 20)) {
    console.error(`- SKU ${result.product.sku}: ${result.error}`);
  }
  process.exitCode = 1;
} else if (!AUDIT) {
  const changed = successful.filter(
    ({ product, uyuPrice, priceSource }) =>
      priceSource !== 'single-price-unverified' && product.price !== uyuPrice,
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
