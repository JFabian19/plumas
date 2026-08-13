/**
 * Google Sheets Price Fetcher
 * 
 * Fetches product prices from a published Google Sheet.
 * The user only needs to type a plain number (e.g. 100, 99.90, 200)
 * in the "precio" column and it will be auto-formatted as "S/ 100.00" on the page.
 * 
 * SETUP REQUIRED:
 * 1. Open Google Sheet: https://docs.google.com/spreadsheets/d/SHEET_ID
 * 2. Go to Archivo > Compartir > Publicar en la web
 * 3. Select "Hoja 1" (or the sheet with products) and format "CSV"
 * 4. Click "Publicar" and copy the URL
 * 5. Update GOOGLE_SHEET_CSV_URL below with that URL
 */

// Google Sheet ID from the user
const GOOGLE_SHEET_ID = '1se0Eu7XwYIwL7fYJathuKqoLBVDsVWsthQXIyfHFnRQ';

// Public published CSV URL (user must "Publish to Web" first)
// Format: https://docs.google.com/spreadsheets/d/{ID}/pub?gid={SHEET_GID}&single=true&output=csv
// gid=0 is typically the first sheet
export const GOOGLE_SHEET_CSV_URL = `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEET_ID}/pub?gid=0&single=true&output=csv`;

export interface SheetPriceEntry {
  productoId: string;
  precio: number | undefined;
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
 * Fetches product prices from the published Google Sheet.
 * Returns a Map of producto_id -> precio (number).
 * 
 * Expected CSV columns: producto_id, ..., precio, ...
 * The precio column should contain ONLY a number (e.g. 100, 99.90, 200).
 * The "S/" symbol is added automatically by the UI.
 */
export async function fetchPricesFromSheet(): Promise<Map<string, number>> {
  const priceMap = new Map<string, number>();

  try {
    const response = await fetch(GOOGLE_SHEET_CSV_URL, {
      cache: 'no-store' // Always get fresh data
    });

    if (!response.ok) {
      console.warn('[PriceFetcher] Google Sheet not accessible. Status:', response.status);
      return priceMap;
    }

    const csvText = await response.text();
    const rows = parseCSV(csvText);

    if (rows.length < 2) {
      console.warn('[PriceFetcher] No data rows found in sheet.');
      return priceMap;
    }

    // First row is the header
    const headers = rows[0].map(h => h.toLowerCase().trim());
    const idIndex = headers.findIndex(h => h === 'producto_id' || h === 'id' || h === 'producto');
    const priceIndex = headers.findIndex(h => h === 'precio' || h === 'price');

    if (idIndex === -1 || priceIndex === -1) {
      console.warn('[PriceFetcher] Could not find "producto_id" or "precio" columns in headers:', headers);
      return priceMap;
    }

    // Parse data rows
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (row.length <= Math.max(idIndex, priceIndex)) continue;

      const productoId = row[idIndex].trim();
      const precioRaw = row[priceIndex].trim();

      if (!productoId || !precioRaw) continue;

      // Clean the price: remove any currency symbols, spaces, commas
      // The user should only enter numbers like: 100, 99.90, 200, 149.99
      const cleanPrice = precioRaw
        .replace(/[sS]\/\.?\s*/g, '') // Remove S/ or s/ if accidentally added
        .replace(/[^0-9.,]/g, '')     // Keep only digits, dots, and commas
        .replace(',', '.');           // Normalize comma as decimal separator

      const precio = parseFloat(cleanPrice);

      if (!isNaN(precio) && precio > 0) {
        priceMap.set(productoId, precio);
      }
    }

    console.log(`[PriceFetcher] Successfully loaded ${priceMap.size} prices from Google Sheet.`);
  } catch (error) {
    console.warn('[PriceFetcher] Error fetching prices from Google Sheet:', error);
  }

  return priceMap;
}
