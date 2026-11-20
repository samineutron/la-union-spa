import type { Product, ProductCategory } from '../../../shared/types/product.types';

const VALID_CATEGORIES: Record<string, ProductCategory> = {
  'articulos de aseo': 'Artículos de aseo',
  'artículos de aseo': 'Artículos de aseo',
  'articulos escolares': 'Artículos escolares',
  'artículos escolares': 'Artículos escolares',
  'articulos aseo personal': 'Artículos aseo personal',
  'artículos aseo personal': 'Artículos aseo personal',
};

function normalizeCategory(raw: string): ProductCategory {
  const key = raw.trim().toLowerCase();
  return VALID_CATEGORIES[key] ?? 'Artículos de aseo';
}

function parseIntSafe(raw: string | undefined, allowNegative = false): number {
  if (!raw) return 0;
  // Elimina signos $, puntos de miles, comas y espacios
  const cleaned = raw.replace(/[^0-9-]/g, '');
  if (!cleaned || cleaned === '-') return 0;
  const parsed = Number.parseInt(cleaned, 10);
  if (!Number.isFinite(parsed)) return 0;
  return allowNegative ? parsed : Math.max(0, parsed);
}

function parseXMayor(raw: string | undefined): number {
  const value = parseIntSafe(raw, true);
  return value > 0 ? value : 0;
}

function sanitizeImageUrl(raw: string | undefined): string {
  if (!raw) return '';
  const trimmed = raw.trim();
  if (!trimmed) return '';
  if (
    trimmed.startsWith('https://') ||
    trimmed.startsWith('http://') ||
    trimmed.startsWith('/')
  ) {
    return trimmed;
  }
  return '';
}

/**
 * Parser CSV compatible con RFC-4180:
 * Soporta comas, comillas escapadas ("") y saltos de línea dentro de celdas entrecomilladas.
 */
export function parseCsvRows(csvText: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let inQuotes = false;

  // Elimina BOM UTF-8 si Google Sheets lo incluye
  const text = csvText.replace(/^\uFEFF/, '');

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (inQuotes) {
      if (char === '"' && nextChar === '"') {
        currentField += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        currentField += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ',') {
      currentRow.push(currentField);
      currentField = '';
    } else if (char === '\r' && nextChar === '\n') {
      currentRow.push(currentField);
      rows.push(currentRow);
      currentRow = [];
      currentField = '';
      i++;
    } else if (char === '\n' || char === '\r') {
      currentRow.push(currentField);
      rows.push(currentRow);
      currentRow = [];
      currentField = '';
    } else {
      currentField += char;
    }
  }

  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField);
    rows.push(currentRow);
  }

  return rows;
}

export function mapCsvToProducts(csvText: string): Product[] {
  const rows = parseCsvRows(csvText);
  if (rows.length < 2) return [];

  const headers = rows[0].map((h) => h.trim().toLowerCase());
  const colIndex = (name: string): number => headers.indexOf(name.toLowerCase());

  const idxId = colIndex('id');
  const idxCodigo = colIndex('codigobarras');
  const idxCategoria = colIndex('categoria');
  const idxProducto = colIndex('producto');
  const idxMarca = colIndex('marca');
  const idxNombre = colIndex('nombre');
  const idxVariante = colIndex('variante');
  const idxContenido = colIndex('contenido');
  const idxStock = colIndex('stock');
  const idxPrecioNormal = colIndex('precionormal');
  const idxPrecioOferta = colIndex('preciooferta');
  const idxPrecioMayorista = colIndex('preciomayorista');
  const idxXMayor = colIndex('xmayor');
  const idxImagen = colIndex('imagen');

  if (idxNombre === -1 || idxPrecioOferta === -1) {
    throw new Error(
      'El archivo CSV no contiene los encabezados esperados (nombre, precioOferta). Verifica que publicaste la pestaña correcta.'
    );
  }

  const products: Product[] = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const getCell = (idx: number): string => (idx >= 0 && idx < row.length ? row[idx].trim() : '');

    const nombre = getCell(idxNombre);
    const codigoBarras = getCell(idxCodigo);

    // Ignorar filas completamente vacías al final de Google Sheets
    if (!nombre && !codigoBarras) continue;

    const rawId = getCell(idxId);
    const id = rawId || codigoBarras || `prod-${i}`;

    const precioNormal = parseIntSafe(getCell(idxPrecioNormal));
    const precioOferta = parseIntSafe(getCell(idxPrecioOferta));
    const precioMayorista = parseIntSafe(getCell(idxPrecioMayorista));
    const xMayor = parseXMayor(getCell(idxXMayor));

    products.push({
      id,
      codigoBarras,
      categoria: normalizeCategory(getCell(idxCategoria)),
      producto: getCell(idxProducto) || 'General',
      marca: getCell(idxMarca) || 'Genérico',
      nombre: nombre || `Producto ${id}`,
      variante: getCell(idxVariante),
      contenido: getCell(idxContenido),
      stock: parseIntSafe(getCell(idxStock)),
      precioNormal,
      precioOferta,
      precioMayorista,
      xMayor,
      imagen: sanitizeImageUrl(getCell(idxImagen)),
    });
  }

  return products;
}

export async function fetchProductsFromGoogleSheet(csvUrl: string): Promise<Product[]> {
  if (!csvUrl || csvUrl.startsWith('PEGAR_AQUI')) {
    throw new Error(
      'Falta configurar la URL CSV de Google Sheets en src/shared/config/store.config.ts.'
    );
  }

  const response = await fetch(csvUrl, {
    method: 'GET',
    headers: {
      Accept: 'text/csv,text/plain;q=0.9,*/*;q=0.8',
    },
  });

  if (!response.ok) {
    throw new Error(`No se pudo descargar el catálogo (HTTP ${response.status}).`);
  }

  const text = await response.text();

  // Detecta si se pegó el enlace normal /edit en vez del enlace publicado como CSV
  if (text.trimStart().startsWith('<!DOCTYPE') || text.trimStart().startsWith('<html')) {
    throw new Error(
      'El enlace devolvió una página HTML en vez de CSV. En Google Sheets usa: Archivo > Compartir > Publicar en la web > Formato CSV.'
    );
  }

  return mapCsvToProducts(text);
}