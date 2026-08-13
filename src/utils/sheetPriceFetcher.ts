/**
 * Google Sheets Price Fetcher
 * 
 * Fetches product prices from a PUBLIC Google Sheet.
 * The user only needs to type a plain number (e.g. 100, 99.90, 200)
 * in the "precio" column and it will be auto-formatted as "S/ 100.00" on the page.
 * 
 * SETUP REQUIRED:
 * 1. Open Google Sheet
 * 2. Click "Compartir" (Share) button (top right)
 * 3. Change to "Cualquier persona con el enlace" (Anyone with the link)
 * 4. Set permission to "Lector" (Viewer)
 * 5. That's it! The page will read prices automatically.
 */

// Google Sheet ID from the user
const GOOGLE_SHEET_ID = '1se0Eu7XwYIwL7fYJathuKqoLBVDsVWsthQXIyfHFnRQ';

// Sheet name where the products are (the tab name in Google Sheets)
const SHEET_NAME = 'Productos';

// Google Visualization API URL - works with sheets shared as "Anyone with the link"
// This is the most reliable method for client-side fetching
const GVIZ_URL = `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(SHEET_NAME)}`;

// Fallback: Published CSV URL (requires "Publish to Web")
const PUBLISHED_URL = `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEET_ID}/pub?output=csv&sheet=${encodeURIComponent(SHEET_NAME)}`;

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
 * Extract prices from parsed CSV rows.
 * Returns a Map of producto_id -> precio (number).
 */
function extractPrices(csvText: string): Map<string, number> {
  const priceMap = new Map<string, number>();
  const rows = parseCSV(csvText);

  if (rows.length < 2) {
    console.warn('[PriceFetcher] No data rows found in sheet.');
    return priceMap;
  }

  // First row is the header - normalize to lowercase
  const headers = rows[0].map(h => h.toLowerCase().replace(/[^a-z_]/g, '').trim());
  
  console.log('[PriceFetcher] Headers found:', headers);

  // Find column indices
  const idIndex = headers.findIndex(h => 
    h === 'producto_id' || h === 'productoid' || h === 'id' || h === 'producto'
  );
  const priceIndex = headers.findIndex(h => 
    h === 'precio' || h === 'price' || h === 'costo'
  );

  if (idIndex === -1) {
    console.warn('[PriceFetcher] Could not find "producto_id" column. Headers:', rows[0]);
    return priceMap;
  }
  if (priceIndex === -1) {
    console.warn('[PriceFetcher] Could not find "precio" column. Headers:', rows[0]);
    return priceMap;
  }

  console.log(`[PriceFetcher] producto_id at column ${idIndex}, precio at column ${priceIndex}`);

  // Parse data rows
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (row.length <= Math.max(idIndex, priceIndex)) continue;

    const productoId = row[idIndex].trim().replace(/^"|"$/g, '');
    const precioRaw = row[priceIndex].trim().replace(/^"|"$/g, '');

    if (!productoId) continue;
    if (!precioRaw) {
      console.log(`[PriceFetcher] No price for "${productoId}" - will show "Consultar"`);
      continue;
    }

    // Clean the price: remove any currency symbols, spaces, extra chars
    // The user should only enter numbers like: 100, 99.90, 200, 149.99
    const cleanPrice = precioRaw
      .replace(/[sS]\/\.?\s*/g, '')   // Remove S/ or s/ if accidentally added  
      .replace(/\s/g, '')              // Remove spaces
      .replace(/[^0-9.,]/g, '')        // Keep only digits, dots, commas
      .replace(',', '.');              // Normalize comma to dot as decimal

    const precio = parseFloat(cleanPrice);

    if (!isNaN(precio) && precio > 0) {
      priceMap.set(productoId, precio);
      console.log(`[PriceFetcher] ✅ ${productoId} => S/ ${precio.toFixed(2)}`);
    }
  }

  return priceMap;
}

/**
 * Try to fetch CSV from a URL.
 * Returns the CSV text or null if failed.
 */
async function tryFetchCSV(url: string, label: string): Promise<string | null> {
  try {
    console.log(`[PriceFetcher] Trying ${label}: ${url}`);
    const response = await fetch(url, { cache: 'no-store' });
    
    if (!response.ok) {
      console.warn(`[PriceFetcher] ${label} failed with status ${response.status}`);
      return null;
    }

    const text = await response.text();
    
    // Basic validation: check if it looks like CSV
    if (text.includes('producto_id') || text.includes('precio') || text.includes(',')) {
      console.log(`[PriceFetcher] ✅ ${label} returned valid CSV (${text.length} bytes)`);
      return text;
    }

    // If it's an HTML error page, skip
    if (text.startsWith('<!') || text.startsWith('<html')) {
      console.warn(`[PriceFetcher] ${label} returned HTML instead of CSV (sheet may not be public)`);
      return null;
    }

    return text;
  } catch (error) {
    console.warn(`[PriceFetcher] ${label} error:`, error);
    return null;
  }
}

/**
 * Fetches product prices from the Google Sheet.
 * Tries multiple URL formats for maximum compatibility.
 * Returns a Map of producto_id -> precio (number).
 * 
 * The user only types a plain number in the Sheet (e.g. 100, 99.90)
 * and the page automatically shows it as "S/ 100.00" with the premium font.
 */
export async function fetchPricesFromSheet(): Promise<Map<string, number>> {
  // Try Google Visualization API first (works with "Anyone with the link" sharing)
  let csvText = await tryFetchCSV(GVIZ_URL, 'Google Visualization API');

  // Fallback to published CSV URL
  if (!csvText) {
    csvText = await tryFetchCSV(PUBLISHED_URL, 'Published CSV');
  }

  if (!csvText) {
    console.warn(
      '[PriceFetcher] ⚠️ Could not fetch prices from Google Sheet.\n' +
      'Make sure the sheet is shared as "Anyone with the link can view".\n' +
      'Sheet ID: ' + GOOGLE_SHEET_ID + '\n' +
      'Sheet tab: ' + SHEET_NAME
    );
    return new Map();
  }

  const priceMap = extractPrices(csvText);
  console.log(`[PriceFetcher] 🎉 Total prices loaded: ${priceMap.size}`);
  return priceMap;
}
