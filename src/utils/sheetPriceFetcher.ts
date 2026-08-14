/**
 * Google Sheets Data Fetcher
 * 
 * Fetches product prices, custom image URLs (imagen_1, imagen_2, imagen_3),
 * and category header images from a PUBLIC Google Sheet.
 * 
 * Works with or WITHOUT "producto_id" column (matches by nombre_completo).
 */

// Google Sheet ID from the user
const GOOGLE_SHEET_ID = '1se0Eu7XwYIwL7fYJathuKqoLBVDsVWsthQXIyfHFnRQ';

// Sheet tab names
const SHEET_NAME_PRODUCTOS = 'Productos';
const SHEET_NAME_CATEGORIAS = 'Categorias';

// Helper to normalize strings for flexible matching (accent-insensitive, lower-case, trimmed)
export function normalizeKey(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "")
    .trim();
}

export interface SheetProductUpdate {
  precio?: number;
  imagenes?: string[];
}

export interface SheetCategoryUpdate {
  imagenHeader?: string;
}

export interface SheetData {
  productsByName: Map<string, SheetProductUpdate>;
  productsById: Map<string, SheetProductUpdate>;
  categoriesById: Map<string, SheetCategoryUpdate>;
}

/**
 * Parse a CSV string into rows of string arrays.
 * Handles quoted fields with commas inside.
 */
function parseCSV(csvText: string): string[][] {
  const rows: string[][] = [];
  const lines = csvText.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const fields: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < trimmed.length; i++) {
      const char = trimmed[i];

      if (char === '"') {
        if (inQuotes && i + 1 < trimmed.length && trimmed[i + 1] === '"') {
          current += '"';
          i++; // skip escaped quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        fields.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    fields.push(current.trim());
    rows.push(fields);
  }

  return rows;
}

/**
 * Helper to clean image URLs from Google Sheets (handles Google Drive links too)
 */
export function cleanImageUrl(url: string): string {
  let clean = url.trim().replace(/^"|"$/g, '');
  if (!clean) return '';

  // Transform Google Drive share URLs to direct image URLs if applicable
  if (clean.includes('drive.google.com/file/d/')) {
    const match = clean.match(/file\/d\/([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      return `https://lh3.googleusercontent.com/d/${match[1]}`;
    }
  } else if (clean.includes('drive.google.com/open?id=')) {
    const match = clean.match(/open\?id=([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      return `https://lh3.googleusercontent.com/d/${match[1]}`;
    }
  }

  return clean;
}

/**
 * Extract product updates from parsed CSV rows.
 */
function extractProducts(csvText: string): { byName: Map<string, SheetProductUpdate>; byId: Map<string, SheetProductUpdate> } {
  const byName = new Map<string, SheetProductUpdate>();
  const byId = new Map<string, SheetProductUpdate>();
  const rows = parseCSV(csvText);

  if (rows.length < 2) return { byName, byId };

  // First row is the header - normalize
  const rawHeaders = rows[0];
  const headers = rawHeaders.map(h => h.toLowerCase().replace(/[^a-z0-9_]/g, '').trim());

  // Find column indices
  const nameIndex = headers.findIndex(h => 
    h === 'nombre_completo' || h === 'nombrecompleto' || h === 'nombre' || h === 'producto' || h === 'modelo'
  );
  const idIndex = headers.findIndex(h => 
    h === 'producto_id' || h === 'productoid' || h === 'id'
  );
  const priceIndex = headers.findIndex(h => 
    h === 'precio' || h === 'price' || h === 'costo'
  );

  // Find image columns (imagen_1, imagen_2, imagen_3 or imagen1, imagen2, etc.)
  const img1Index = headers.findIndex(h => h === 'imagen_1' || h === 'imagen1' || h === 'foto1' || h === 'foto_1' || h === 'imagen');
  const img2Index = headers.findIndex(h => h === 'imagen_2' || h === 'imagen2' || h === 'foto2' || h === 'foto_2');
  const img3Index = headers.findIndex(h => h === 'imagen_3' || h === 'imagen3' || h === 'foto3' || h === 'foto_3');

  // Parse data rows
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const nombreRaw = nameIndex !== -1 && row[nameIndex] ? row[nameIndex].trim().replace(/^"|"$/g, '') : '';
    const idRaw = idIndex !== -1 && row[idIndex] ? row[idIndex].trim().replace(/^"|"$/g, '') : '';
    const precioRaw = priceIndex !== -1 && row[priceIndex] ? row[priceIndex].trim().replace(/^"|"$/g, '') : '';

    const img1Raw = img1Index !== -1 && row[img1Index] ? cleanImageUrl(row[img1Index]) : '';
    const img2Raw = img2Index !== -1 && row[img2Index] ? cleanImageUrl(row[img2Index]) : '';
    const img3Raw = img3Index !== -1 && row[img3Index] ? cleanImageUrl(row[img3Index]) : '';

    const imagenes: string[] = [img1Raw, img2Raw, img3Raw].filter(Boolean);

    let precio: number | undefined = undefined;
    if (precioRaw) {
      const cleanPrice = precioRaw
        .replace(/[sS]\/\.?\s*/g, '')
        .replace(/\s/g, '')
        .replace(/[^0-9.,]/g, '')
        .replace(',', '.');
      const parsed = parseFloat(cleanPrice);
      if (!isNaN(parsed) && parsed > 0) {
        precio = parsed;
      }
    }

    const update: SheetProductUpdate = {};
    if (precio !== undefined) update.precio = precio;
    if (imagenes.length > 0) update.imagenes = imagenes;

    if (Object.keys(update).length === 0) continue;

    if (nombreRaw) {
      byName.set(normalizeKey(nombreRaw), update);
    }
    if (idRaw) {
      byId.set(idRaw, update);
    }
  }

  return { byName, byId };
}

/**
 * Extract category updates from parsed CSV rows (Categorias tab).
 */
function extractCategories(csvText: string): Map<string, SheetCategoryUpdate> {
  const catMap = new Map<string, SheetCategoryUpdate>();
  const rows = parseCSV(csvText);
  if (rows.length < 2) return catMap;

  const headers = rows[0].map(h => h.toLowerCase().replace(/[^a-z0-9_]/g, '').trim());
  const idIndex = headers.findIndex(h => h === 'categoria_id' || h === 'categoriaid' || h === 'id' || h === 'categoria' || h === 'nombre');
  const imgIndex = headers.findIndex(h => h === 'imagen_url' || h === 'imagenurl' || h === 'imagen_header' || h === 'imagen' || h === 'foto');

  if (idIndex === -1 || imgIndex === -1) return catMap;

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const catIdRaw = row[idIndex] ? row[idIndex].trim().replace(/^"|"$/g, '') : '';
    const imgRaw = row[imgIndex] ? cleanImageUrl(row[imgIndex]) : '';

    if (!catIdRaw || !imgRaw) continue;

    catMap.set(normalizeKey(catIdRaw), { imagenHeader: imgRaw });
    catMap.set(catIdRaw.toLowerCase(), { imagenHeader: imgRaw });
  }

  return catMap;
}

/**
 * Try to fetch CSV from a URL.
 */
async function tryFetchCSV(url: string, label: string): Promise<string | null> {
  try {
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) return null;
    const text = await response.text();

    if (text.startsWith('<!') || text.startsWith('<html')) {
      return null;
    }
    return text;
  } catch (error) {
    console.warn(`[SheetFetcher] ${label} error:`, error);
    return null;
  }
}

/**
 * Main function to fetch all live data from Google Sheets.
 */
export async function fetchLiveSheetData(): Promise<SheetData> {
  const gvizUrlProducts = `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(SHEET_NAME_PRODUCTOS)}`;
  const gvizUrlCategories = `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(SHEET_NAME_CATEGORIAS)}`;

  const [productsCsv, categoriesCsv] = await Promise.all([
    tryFetchCSV(gvizUrlProducts, 'Productos'),
    tryFetchCSV(gvizUrlCategories, 'Categorias')
  ]);

  let byName = new Map<string, SheetProductUpdate>();
  let byId = new Map<string, SheetProductUpdate>();
  let categoriesById = new Map<string, SheetCategoryUpdate>();

  if (productsCsv) {
    const extracted = extractProducts(productsCsv);
    byName = extracted.byName;
    byId = extracted.byId;
  }

  if (categoriesCsv) {
    categoriesById = extractCategories(categoriesCsv);
  }

  return {
    productsByName: byName,
    productsById: byId,
    categoriesById
  };
}

// Backward-compatible price fetcher
export async function fetchPricesFromSheet(): Promise<Map<string, number>> {
  const data = await fetchLiveSheetData();
  const priceMap = new Map<string, number>();
  for (const [name, update] of data.productsByName.entries()) {
    if (update.precio !== undefined) priceMap.set(name, update.precio);
  }
  for (const [id, update] of data.productsById.entries()) {
    if (update.precio !== undefined) priceMap.set(id, update.precio);
  }
  return priceMap;
}
