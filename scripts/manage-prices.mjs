import { readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectDirectory = path.resolve(scriptDirectory, '..');
const catalogPath = path.join(projectDirectory, 'app', 'catalog-data.ts');
const csvPath = path.join(projectDirectory, 'catalog-prices.csv');
const command = process.argv[2] ?? 'export';
const inputArgument = process.argv.find((argument) => argument.startsWith('--input='));
const dryRun = process.argv.includes('--dry-run');

function parseCatalog(source) {
  const marker = 'export const products: Product[] = ';
  const markerIndex = source.indexOf(marker);
  const arrayStart = source.indexOf('[', markerIndex + marker.length);
  const arrayEnd = source.lastIndexOf('];');

  if (markerIndex === -1 || arrayStart === -1 || arrayEnd <= arrayStart) {
    throw new Error('No se pudo leer la lista de productos.');
  }

  return JSON.parse(source.slice(arrayStart, arrayEnd + 1));
}

function escapeCsv(value) {
  const text = String(value ?? '');
  return /[;"\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function parseCsvLine(line) {
  const values = [];
  let value = '';
  let quoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    if (character === '"') {
      if (quoted && line[index + 1] === '"') {
        value += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (character === ';' && !quoted) {
      values.push(value);
      value = '';
    } else {
      value += character;
    }
  }

  values.push(value);
  return values;
}

function parseCsv(source) {
  const lines = source.replace(/^\uFEFF/, '').split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) throw new Error('El CSV no contiene productos.');

  const headers = parseCsvLine(lines[0]);
  const requiredHeaders = ['sku', 'priceUyu'];
  for (const header of requiredHeaders) {
    if (!headers.includes(header)) throw new Error(`Falta la columna ${header}.`);
  }

  return lines.slice(1).map((line, lineIndex) => {
    const values = parseCsvLine(line);
    const row = Object.fromEntries(headers.map((header, index) => [header, values[index] ?? '']));
    const price = Number(row.priceUyu);
    if (!/^\d+$/.test(row.sku) || !Number.isInteger(price) || price <= 0) {
      throw new Error(`Fila ${lineIndex + 2}: SKU o priceUyu inválido.`);
    }
    return { sku: row.sku, price };
  });
}

function replaceProductPrice(source, product, newPrice) {
  const pattern = new RegExp(
    `(\\{\\s*"id":\\s*${product.id},\\s*"sku":\\s*"${product.sku}"[\\s\\S]*?"price":\\s*)\\d+`,
  );
  const updated = source.replace(pattern, `$1${newPrice}`);
  if (updated === source && product.price !== newPrice) {
    throw new Error(`No se pudo actualizar el SKU ${product.sku}.`);
  }
  return updated;
}

const source = await readFile(catalogPath, 'utf8');
const products = parseCatalog(source);

if (command === 'export') {
  const headers = ['sku', 'name', 'brand', 'category', 'priceUyu'];
  const rows = products.map((product) =>
    [product.sku, product.name, product.brand, product.category, product.price]
      .map(escapeCsv)
      .join(';'),
  );
  await writeFile(csvPath, `${headers.join(';')}\n${rows.join('\n')}\n`, 'utf8');
  console.log(`Listado exportado: ${path.relative(projectDirectory, csvPath)}`);
} else if (command === 'import') {
  if (!inputArgument) throw new Error('Usá --input=ruta/al/archivo.csv.');
  const inputPath = path.resolve(process.cwd(), inputArgument.split('=').slice(1).join('='));
  const rows = parseCsv(await readFile(inputPath, 'utf8'));
  const productsBySku = new Map(products.map((product) => [product.sku, product]));
  const seen = new Set();
  let updatedSource = source;
  let changes = 0;

  for (const row of rows) {
    if (seen.has(row.sku)) throw new Error(`SKU duplicado: ${row.sku}.`);
    seen.add(row.sku);
    const product = productsBySku.get(row.sku);
    if (!product) throw new Error(`El SKU ${row.sku} no existe en el catálogo.`);
    if (product.price !== row.price) {
      updatedSource = replaceProductPrice(updatedSource, product, row.price);
      changes += 1;
    }
  }

  console.log(`Filas revisadas: ${rows.length}. Cambios detectados: ${changes}.`);
  if (dryRun || updatedSource === source) {
    console.log(dryRun ? 'Simulación finalizada: no se modificó el catálogo.' : 'El catálogo ya estaba actualizado.');
  } else {
    const temporaryPath = `${catalogPath}.tmp`;
    await writeFile(temporaryPath, updatedSource, 'utf8');
    await rename(temporaryPath, catalogPath);
    console.log('Catálogo actualizado correctamente.');
  }
} else {
  throw new Error(`Comando desconocido: ${command}. Usá export o import.`);
}