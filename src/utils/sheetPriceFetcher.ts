/**
 * Google Sheets Data Fetcher & Product Synchronizer
 * 
 * Fetches products, prices, sizes, colors, custom image URLs,
 * and category header images from a PUBLIC Google Sheet.
 * 
 * Automatically creates new products and assigns them to their respective categories
 * no matter what row they are placed in the Google Sheet.
 */

import { 
  JEANS_PRODUCTS, CATEGORIAS_JEANS, JeansProduct, 
  CategoriaJeans, ColorVariant 
} from '../data/jeansData';

// Google Sheet ID
const GOOGLE_SHEET_ID = '1se0Eu7XwYIwL7fYJathuKqoLBVDsVWsthQXIyfHFnRQ';

// Sheet tab names
const SHEET_NAME_PRODUCTOS = 'Productos';
const SHEET_NAME_CATEGORIAS = 'Categorias';

// Helper to normalize strings for flexible matching (accent-insensitive, lower-case, trimmed)
export function normalizeKey(str: string): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "")
    .trim();
}

// Color Hex Map for realistic swatches
const COLOR_HEX_MAP: Record<string, string> = {
  azul: '#2563eb',
  'azul clasico': '#1d4ed8',
  'azul vintage': '#3b82f6',
  'azul cristal': '#60a5fa',
  'azul pacific': '#1e40af',
  'azul denim': '#2563eb',
  'azul winter': '#1d4ed8',
  celeste: '#38bdf8',
  'celeste summer': '#7dd3fc',
  hielo: '#bae6fd',
  negro: '#0f172a',
  'negro stone': '#1e293b',
  'negro deep': '#020617',
  plomo: '#64748b',
  'plomo claro': '#cbd5e1',
  'plomo intermedio': '#94a3b8',
  'plomo oscuro': '#475569',
  'plomo ejecutivo': '#334155',
  grafito: '#334155',
  acero: '#64748b',
  maiz: '#eab308',
  'maiz acid': '#facc15',
  'maiz soft': '#fde047',
  beige: '#d4b996',
  'beige khaki': '#c2a67e',
  khaki: '#c2a67e',
  verde: '#15803d',
  'verde olivo': '#4d7c0f',
  'verdoso olive': '#3f6212',
  blanco: '#f8fafc',
  rojo: '#dc2626',
  marron: '#78350f',
  mostaza: '#ca8a04',
  camel: '#c19a6b',
  crema: '#fef3c7',
  vino: '#881337',
  palo_rosa: '#f472b6',
};

export function getColorHex(name: string): string {
  const norm = normalizeKey(name);
  if (COLOR_HEX_MAP[norm]) return COLOR_HEX_MAP[norm];
  
  // Partial matches
  for (const [key, hex] of Object.entries(COLOR_HEX_MAP)) {
    if (norm.includes(normalizeKey(key)) || normalizeKey(key).includes(norm)) {
      return hex;
    }
  }
  return '#64748b'; // default slate color
}

// Category fallback banner images and default metadata
const CATEGORY_DEFAULT_DATA: Record<string, { name: string; subtitulo: string; descripcion: string; imagenHeader: string; badge: string }> = {
  'pantalones-jeans': {
    name: 'Pantalones Jeans',
    subtitulo: 'Cortes Clásicos, Pitillos, Semi Pitillos y Strech',
    descripcion: 'Confeccionados en denim de alta calidad con tecnología stretch y acabados de lavado exclusivo.',
    imagenHeader: '/cat_pantalones_jeans.png',
    badge: 'Colección Clásica'
  },
  'pantalones-dril': {
    name: 'Pantalones Dril',
    subtitulo: 'Estilo Ejecutivo & Urbano en Algodón Dril',
    descripcion: 'Pantalones de corte impecable y tejido dril confortable, ideales para el día a día y ocasiones vestir.',
    imagenHeader: '/cat_pantalones_dril.png',
    badge: 'Confort Versátil'
  },
  'pantalones-sueltos': {
    name: 'Pantalones Sueltos',
    subtitulo: 'Cargo Jeans, Bagui Fit & Moon Jeans',
    descripcion: 'Siluetas holgadas y tendencia streetwear para el máximo confort y soltura.',
    imagenHeader: '/cat_pantalones_sueltos.png',
    badge: 'Tendencia Urbana'
  },
  'short': {
    name: 'Shorts',
    subtitulo: 'Shorts Jeans, Dril, Cargo y Sueltos',
    descripcion: 'Frescura, soltura y durabilidad para días calurosos o estilo urbano veraniego.',
    imagenHeader: '/cat_short.png',
    badge: 'Frescura & Moda'
  },
  'casacas': {
    name: 'Casacas',
    subtitulo: 'Casacas Jeans Clásicas & con Peluche Sherpa',
    descripcion: 'Abrigo con actitud denim, diseñadas para durar y destacar en cualquier look.',
    imagenHeader: '/cat_casacas.png',
    badge: 'Outerwear Premium'
  }
};

// Map any raw string category from Sheet to a clean category ID and proper display name
export function normalizeCategory(rawCategory: string): { id: string; name: string } {
  if (!rawCategory) return { id: 'pantalones-jeans', name: 'Pantalones Jeans' };
  
  const norm = normalizeKey(rawCategory);

  if (norm.includes('pantalonesjean') || norm.includes('jean') || norm === 'jeans') {
    return { id: 'pantalones-jeans', name: 'Pantalones Jeans' };
  }
  if (norm.includes('dril') || norm.includes('drill')) {
    return { id: 'pantalones-dril', name: 'Pantalones Dril' };
  }
  if (norm.includes('suelto') || norm.includes('bagui') || norm.includes('baggy') || norm.includes('cargo') || norm.includes('mom') || norm.includes('moon')) {
    return { id: 'pantalones-sueltos', name: 'Pantalones Sueltos' };
  }
  if (norm.includes('short') || norm.includes('bermuda')) {
    return { id: 'short', name: 'Shorts' };
  }
  if (norm.includes('casaca') || norm.includes('jacket') || norm.includes('abrigo') || norm.includes('sherpa')) {
    return { id: 'casacas', name: 'Casacas' };
  }

  // Dynamic new category
  const cleanName = rawCategory.trim().replace(/^"|"$/g, '');
  const slug = cleanName
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return { id: slug || 'otros', name: cleanName || 'Otros' };
}

// Fallback images for newly created products based on category
const CATEGORY_DEFAULT_IMAGES: Record<string, string[]> = {
  'pantalones-jeans': [
    '/WhatsApp Image 2026-08-10 at 17.29.42.jpeg',
    '/WhatsApp Image 2026-08-10 at 17.29.43.jpeg',
    '/WhatsApp Image 2026-08-10 at 17.29.44 (2).jpeg'
  ],
  'pantalones-dril': [
    '/WhatsApp Image 2026-08-10 at 17.29.47.jpeg',
    '/WhatsApp Image 2026-08-10 at 17.29.47 (1).jpeg',
    '/WhatsApp Image 2026-08-10 at 17.29.47 (2).jpeg'
  ],
  'pantalones-sueltos': [
    '/WhatsApp Image 2026-08-10 at 17.29.48.jpeg',
    '/WhatsApp Image 2026-08-10 at 17.29.48 (1).jpeg',
    '/WhatsApp Image 2026-08-10 at 17.29.48 (2).jpeg'
  ],
  'short': [
    '/WhatsApp Image 2026-08-10 at 17.29.49.jpeg',
    '/WhatsApp Image 2026-08-10 at 17.29.49 (1).jpeg',
    '/WhatsApp Image 2026-08-10 at 17.29.49 (2).jpeg'
  ],
  'casacas': [
    '/WhatsApp Image 2026-08-10 at 17.29.45 (1).jpeg',
    '/WhatsApp Image 2026-08-10 at 17.29.45 (2).jpeg',
    '/WhatsApp Image 2026-08-10 at 17.29.44.jpeg'
  ]
};

export interface SheetProductUpdate {
  precio?: number;
  precioOriginal?: number;
  imagenes?: string[];
  tallas?: (number | string)[];
  colores?: ColorVariant[];
  descripcion?: string;
}

export interface SheetCategoryUpdate {
  imagenHeader?: string;
  nombre?: string;
  subtitulo?: string;
  descripcion?: string;
}

export interface SheetData {
  products: JeansProduct[];
  categories: CategoriaJeans[];
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
  const lines = csvText.split(/\r?\n/);

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
  if (!url) return '';
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
 * Parse comma-separated sizes string into array
 */
function parseSizes(sizeRaw: string): (number | string)[] {
  if (!sizeRaw) return [28, 30, 32, 34, 36];
  
  const clean = sizeRaw.replace(/^"|"$/g, '').trim();
  if (!clean) return [28, 30, 32, 34, 36];

  const parts = clean.split(/[,;\-\/]+/).map(p => p.trim()).filter(Boolean);
  if (parts.length === 0) return [28, 30, 32, 34, 36];

  return parts.map(p => {
    const num = parseInt(p, 10);
    return isNaN(num) ? p.toUpperCase() : num;
  });
}

/**
 * Parse comma-separated colors string into ColorVariant array
 */
function parseColors(colorRaw: string, images: string[], categoryId: string): ColorVariant[] {
  const fallbackList = CATEGORY_DEFAULT_IMAGES[categoryId] || CATEGORY_DEFAULT_IMAGES['pantalones-jeans'];
  
  if (!colorRaw) {
    return [
      { nombre: "Azul Clásico", imagen: images[0] || fallbackList[0], hexColor: "#2563eb" },
      { nombre: "Negro", imagen: images[1] || images[0] || fallbackList[1], hexColor: "#0f172a" },
    ];
  }

  const clean = colorRaw.replace(/^"|"$/g, '').trim();
  const names = clean.split(/[,;]+/).map(c => c.trim().replace(/^"|"$/g, '')).filter(Boolean);

  if (names.length === 0) {
    return [
      { nombre: "Azul Clásico", imagen: images[0] || fallbackList[0], hexColor: "#2563eb" },
    ];
  }

  return names.map((name, idx) => {
    const hex = getColorHex(name);
    // Assign specific custom image if available, else cycle through custom/fallback images
    let img = images[idx] || images[0] || fallbackList[idx % fallbackList.length];
    return {
      nombre: name,
      imagen: img,
      hexColor: hex
    };
  });
}

/**
 * Parse price number from raw string
 */
function parsePrice(raw: string): number | undefined {
  if (!raw) return undefined;
  const cleanPrice = raw
    .replace(/[sS]\/\.?\s*/g, '')
    .replace(/\s/g, '')
    .replace(/[^0-9.,]/g, '')
    .replace(',', '.');
  const parsed = parseFloat(cleanPrice);
  return !isNaN(parsed) && parsed > 0 ? parsed : undefined;
}

/**
 * Main parser: processes CSV content from Productos and Categorias tabs,
 * merging existing products and creating all new products added in the Sheet.
 */
export function processFullSheetData(productsCsv: string, categoriesCsv: string | null): SheetData {
  const byName = new Map<string, SheetProductUpdate>();
  const byId = new Map<string, SheetProductUpdate>();
  const categoriesById = new Map<string, SheetCategoryUpdate>();

  // 1. Process Categorias Tab if available
  if (categoriesCsv) {
    const catRows = parseCSV(categoriesCsv);
    if (catRows.length >= 2) {
      const headers = catRows[0].map(h => h.toLowerCase().replace(/[^a-z0-9_]/g, '').trim());
      const nameIndex = headers.findIndex(h => h === 'categoria' || h === 'nombre' || h === 'categoria_id' || h === 'id');
      const imgIndex = headers.findIndex(h => h === 'imagen_url' || h === 'imagenurl' || h === 'imagen_header' || h === 'imagen' || h === 'foto');

      if (nameIndex !== -1 && imgIndex !== -1) {
        for (let i = 1; i < catRows.length; i++) {
          const row = catRows[i];
          const catNameRaw = row[nameIndex] ? row[nameIndex].trim().replace(/^"|"$/g, '') : '';
          const imgRaw = row[imgIndex] ? cleanImageUrl(row[imgIndex]) : '';

          if (!catNameRaw || !imgRaw) continue;

          const catInfo = normalizeCategory(catNameRaw);
          categoriesById.set(catInfo.id, { imagenHeader: imgRaw, nombre: catInfo.name });
          categoriesById.set(normalizeKey(catNameRaw), { imagenHeader: imgRaw, nombre: catInfo.name });
        }
      }
    }
  }

  // 2. Process Productos Tab
  const rows = parseCSV(productsCsv);
  if (rows.length < 2) {
    return {
      products: JEANS_PRODUCTS,
      categories: CATEGORIAS_JEANS,
      productsByName: byName,
      productsById: byId,
      categoriesById
    };
  }

  // Find column indices
  const rawHeaders = rows[0];
  const headers = rawHeaders.map(h => h.toLowerCase().replace(/[^a-z0-9_]/g, '').trim());

  const catIndex = headers.findIndex(h => h === 'categoria' || h === 'seccion' || h === 'categoria_id');
  const brandIndex = headers.findIndex(h => h === 'marca' || h === 'brand');
  const nameIndex = headers.findIndex(h => 
    h === 'nombre_completo' || h === 'nombrecompleto' || h === 'nombre' || h === 'producto' || h === 'modelo'
  );
  const idIndex = headers.findIndex(h => h === 'producto_id' || h === 'productoid' || h === 'id');
  const cutIndex = headers.findIndex(h => h === 'corte' || h === 'tipo_corte' || h === 'fit');
  const priceIndex = headers.findIndex(h => h === 'precio' || h === 'price' || h === 'costo');
  const originalPriceIndex = headers.findIndex(h => h === 'precio_original' || h === 'preciooriginal' || h === 'precio_antes');
  const sizesIndex = headers.findIndex(h => h === 'tallas_disponibles' || h === 'tallas' || h === 'sizes');
  const colorsIndex = headers.findIndex(h => h === 'colores_disponibles' || h === 'colores' || h === 'colors');
  const descIndex = headers.findIndex(h => h === 'descripcion' || h === 'description' || h === 'detalle');

  const img1Index = headers.findIndex(h => h === 'imagen_1' || h === 'imagen1' || h === 'foto1' || h === 'foto_1' || h === 'imagen');
  const img2Index = headers.findIndex(h => h === 'imagen_2' || h === 'imagen2' || h === 'foto2' || h === 'foto_2');
  const img3Index = headers.findIndex(h => h === 'imagen_3' || h === 'imagen3' || h === 'foto3' || h === 'foto_3');

  // Track existing static products in map
  const processedProducts: JeansProduct[] = [];
  const matchedStaticIds = new Set<string>();

  // Map static products by normalized key
  const staticByKey = new Map<string, JeansProduct>();
  const staticById = new Map<string, JeansProduct>();
  for (const p of JEANS_PRODUCTS) {
    staticByKey.set(normalizeKey(p.nombreCompleto), p);
    staticByKey.set(normalizeKey(p.modelo), p);
    staticById.set(p.id, p);
  }

  // Discovered categories list
  const activeCategoriesMap = new Map<string, CategoriaJeans>();
  for (const c of CATEGORIAS_JEANS) {
    activeCategoriesMap.set(c.id, { ...c });
  }

  // Iterate over each row in the Google Sheet
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const rawName = nameIndex !== -1 && row[nameIndex] ? row[nameIndex].trim().replace(/^"|"$/g, '') : '';
    const rawBrand = brandIndex !== -1 && row[brandIndex] ? row[brandIndex].trim().replace(/^"|"$/g, '') : '';
    const rawCat = catIndex !== -1 && row[catIndex] ? row[catIndex].trim().replace(/^"|"$/g, '') : '';
    const rawId = idIndex !== -1 && row[idIndex] ? row[idIndex].trim().replace(/^"|"$/g, '') : '';
    const rawCut = cutIndex !== -1 && row[cutIndex] ? row[cutIndex].trim().replace(/^"|"$/g, '') : '';
    const rawPrice = priceIndex !== -1 && row[priceIndex] ? row[priceIndex].trim().replace(/^"|"$/g, '') : '';
    const rawOrigPrice = originalPriceIndex !== -1 && row[originalPriceIndex] ? row[originalPriceIndex].trim().replace(/^"|"$/g, '') : '';
    const rawSizes = sizesIndex !== -1 && row[sizesIndex] ? row[sizesIndex].trim().replace(/^"|"$/g, '') : '';
    const rawColors = colorsIndex !== -1 && row[colorsIndex] ? row[colorsIndex].trim().replace(/^"|"$/g, '') : '';
    const rawDesc = descIndex !== -1 && row[descIndex] ? row[descIndex].trim().replace(/^"|"$/g, '') : '';

    if (!rawName && !rawId) continue;

    const img1 = img1Index !== -1 && row[img1Index] ? cleanImageUrl(row[img1Index]) : '';
    const img2 = img2Index !== -1 && row[img2Index] ? cleanImageUrl(row[img2Index]) : '';
    const img3 = img3Index !== -1 && row[img3Index] ? cleanImageUrl(row[img3Index]) : '';
    const imagenes: string[] = [img1, img2, img3].filter(Boolean);

    const precio = parsePrice(rawPrice);
    const precioOriginal = parsePrice(rawOrigPrice);
    const tallas = parseSizes(rawSizes);

    const catInfo = normalizeCategory(rawCat || 'Pantalones Jeans');
    const categoryId = catInfo.id;

    // Register / update category in active categories map
    if (!activeCategoriesMap.has(categoryId)) {
      const defaultMeta = CATEGORY_DEFAULT_DATA[categoryId] || {
        name: catInfo.name,
        subtitulo: `Colección de ${catInfo.name}`,
        descripcion: `Descubre nuestra exclusiva selección de ${catInfo.name.toLowerCase()} con la mejor calidad nacional.`,
        imagenHeader: '/cat_pantalones_jeans.png',
        badge: 'Nueva Colección'
      };

      activeCategoriesMap.set(categoryId, {
        id: categoryId,
        nombre: defaultMeta.name,
        subtitulo: defaultMeta.subtitulo,
        descripcion: defaultMeta.descripcion,
        imagenHeader: defaultMeta.imagenHeader,
        badge: defaultMeta.badge
      });
    }

    // Check if this sheet row matches an existing static product
    const key = normalizeKey(rawName);
    const matchedStatic = (rawId && staticById.get(rawId)) || staticByKey.get(key);

    const update: SheetProductUpdate = {};
    if (precio !== undefined) update.precio = precio;
    if (precioOriginal !== undefined) update.precioOriginal = precioOriginal;
    if (imagenes.length > 0) update.imagenes = imagenes;
    if (rawSizes) update.tallas = tallas;
    if (rawDesc) update.descripcion = rawDesc;

    if (rawName) byName.set(key, update);
    if (rawId) byId.set(rawId, update);

    if (matchedStatic) {
      // Merge with static product
      matchedStaticIds.add(matchedStatic.id);

      const parsedColores = rawColors 
        ? parseColors(rawColors, imagenes.length > 0 ? imagenes : matchedStatic.colores.map(c => c.imagen), categoryId)
        : matchedStatic.colores;

      // Update color images if new images provided
      if (imagenes.length > 0 && !rawColors) {
        parsedColores[0].imagen = imagenes[0];
        if (imagenes[1] && parsedColores[1]) parsedColores[1].imagen = imagenes[1];
        if (imagenes[2] && parsedColores[2]) parsedColores[2].imagen = imagenes[2];
      }

      processedProducts.push({
        ...matchedStatic,
        categoriaId: categoryId,
        marca: rawBrand || matchedStatic.marca,
        corte: rawCut || matchedStatic.corte,
        precio: precio !== undefined ? precio : matchedStatic.precio,
        precioOriginal: precioOriginal !== undefined ? precioOriginal : matchedStatic.precioOriginal,
        descripcion: rawDesc || matchedStatic.descripcion,
        tallasDisponibles: rawSizes ? tallas : matchedStatic.tallasDisponibles,
        imagenes: imagenes.length > 0 ? imagenes : matchedStatic.imagenes,
        colores: parsedColores
      });
    } else {
      // NEW PRODUCT CREATED IN GOOGLE SHEETS!
      const generatedId = rawId || `${normalizeKey(rawBrand || 'plumas')}-${normalizeKey(rawName)}`;
      const cleanBrand = rawBrand || 'Plumas';
      const cleanCut = rawCut || 'Corte Clásico';
      const cleanDesc = rawDesc || `Prenda de alta calidad confeccionada con los mejores acabados de la marca ${cleanBrand}.`;
      
      const colores = parseColors(rawColors, imagenes, categoryId);

      const newProduct: JeansProduct = {
        id: generatedId,
        categoriaId: categoryId,
        marca: cleanBrand,
        modelo: rawName,
        nombreCompleto: rawName,
        corte: cleanCut,
        precio: precio,
        precioOriginal: precioOriginal,
        descripcion: cleanDesc,
        detalles: [
          `Confección con estándares de calidad ${cleanBrand}`,
          `Corte ${cleanCut} ergonómico y confortable`,
          `Envíos a todo el Perú por agencia`
        ],
        destacado: false,
        nuevo: true,
        stockLimitado: true,
        tallasDisponibles: tallas,
        imagenes: imagenes.length > 0 ? imagenes : undefined,
        imagenPoster: imagenes[1] || imagenes[0] || colores[0].imagen,
        colores: colores
      };

      processedProducts.push(newProduct);
    }
  }

  // Include any remaining static products that were not in the sheet
  for (const staticProd of JEANS_PRODUCTS) {
    if (!matchedStaticIds.has(staticProd.id)) {
      processedProducts.push(staticProd);
    }
  }

  // Merge category header images if specified in Google Sheets (Categorias tab)
  const finalCategories: CategoriaJeans[] = Array.from(activeCategoriesMap.values()).map(cat => {
    const catUpdate = categoriesById.get(cat.id) ||
                      categoriesById.get(normalizeKey(cat.nombre)) ||
                      categoriesById.get(cat.id.toLowerCase());
    if (catUpdate && catUpdate.imagenHeader) {
      return { ...cat, imagenHeader: catUpdate.imagenHeader };
    }
    return cat;
  });

  return {
    products: processedProducts,
    categories: finalCategories,
    productsByName: byName,
    productsById: byId,
    categoriesById
  };
}

/**
 * Main function to fetch all live data from Google Sheets.
 */
export async function fetchLiveSheetData(): Promise<SheetData> {
  const gvizUrlProducts = `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(SHEET_NAME_PRODUCTOS)}`;
  const gvizUrlCategories = `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(SHEET_NAME_CATEGORIAS)}`;

  try {
    const [productsRes, categoriesRes] = await Promise.all([
      fetch(gvizUrlProducts, { cache: 'no-store' }),
      fetch(gvizUrlCategories, { cache: 'no-store' })
    ]);

    const productsCsv = productsRes.ok ? await productsRes.text() : null;
    const categoriesCsv = categoriesRes.ok ? await categoriesRes.text() : null;

    if (productsCsv && !productsCsv.startsWith('<!') && !productsCsv.startsWith('<html')) {
      return processFullSheetData(productsCsv, categoriesCsv);
    }
  } catch (error) {
    console.warn('[SheetFetcher] Error fetching from Google Sheets:', error);
  }

  return {
    products: JEANS_PRODUCTS,
    categories: CATEGORIAS_JEANS,
    productsByName: new Map(),
    productsById: new Map(),
    categoriesById: new Map()
  };
}

// Backward-compatible price fetcher
export async function fetchPricesFromSheet(): Promise<Map<string, number>> {
  const data = await fetchLiveSheetData();
  const priceMap = new Map<string, number>();
  for (const p of data.products) {
    if (p.precio !== undefined) {
      priceMap.set(p.id, p.precio);
      priceMap.set(normalizeKey(p.nombreCompleto), p.precio);
    }
  }
  return priceMap;
}
