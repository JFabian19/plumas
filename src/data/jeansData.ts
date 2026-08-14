export interface ColorVariant {
  nombre: string;
  imagen: string;
  hexColor: string;
}

export type CategoriaId = 'pantalones-jeans' | 'pantalones-dril' | 'pantalones-sueltos' | 'short' | 'casacas';

export interface JeansProduct {
  id: string;
  categoriaId: CategoriaId;
  marca: 'Lois' | 'Element' | 'Pionier' | 'Bronco' | 'Plumas';
  modelo: string;
  nombreCompleto: string;
  corte: string;
  precio?: number; // Permite números simples (ej: 100, 100.99, 200) sin símbolo de soles
  precioOriginal?: number;
  descripcion: string;
  detalles: string[];
  destacado?: boolean;
  nuevo?: boolean;
  stockLimitado?: boolean;
  tallasDisponibles: (number | string)[];
  imagenPoster?: string;
  imagenes?: string[];
  colores: ColorVariant[];
}

export interface CategoriaJeans {
  id: CategoriaId;
  nombre: string;
  subtitulo: string;
  descripcion: string;
  imagenHeader: string;
  badge: string;
}

export const LOGO_IMAGE = "/WhatsApp Image 2026-08-10 at 17.29.49 (3).jpeg";
export const SHOWCASE_MODEL_IMAGE = "/WhatsApp Image 2026-08-10 at 17.29.53.jpeg";
export const MARQUEE_ANNOUNCEMENT = "🪶 PLUMAS JEANS • TIENDA OFICIAL DE JEANS & MODA PREMIUM • LOIS, ELEMENT, PIONIER, BRONCO • ENVÍOS RÁPIDOS A TODO EL PERÚ • TALLAS 28 A 36 ⚡ STOCK LIMITADO 🪶";

export const CATEGORIAS_JEANS: CategoriaJeans[] = [
  {
    id: 'pantalones-jeans',
    nombre: 'Pantalones Jeans',
    subtitulo: 'Cortes Clásicos, Pitillos, Semi Pitillos y Strech',
    descripcion: 'Confeccionados en denim de alta calidad con tecnología stretch y acabados de lavado exclusivo.',
    imagenHeader: '/cat_pantalones_jeans.png',
    badge: 'Colección Clásica'
  },
  {
    id: 'pantalones-dril',
    nombre: 'Pantalones Dril',
    subtitulo: 'Estilo Ejecutivo & Urbano en Algodón Dril',
    descripcion: 'Pantalones de corte impecable y tejido dril confortable, ideales para el día a día y ocasiones vestir.',
    imagenHeader: '/cat_pantalones_dril.png',
    badge: 'Confort Versátil'
  },
  {
    id: 'pantalones-sueltos',
    nombre: 'Pantalones Sueltos',
    subtitulo: 'Cargo Jeans, Bagui Fit & Moon Jeans',
    descripcion: 'Siluetas holgadas y tendencia streetwear para el máximo confort y soltura.',
    imagenHeader: '/cat_pantalones_sueltos.png',
    badge: 'Tendencia Urbana'
  },
  {
    id: 'short',
    nombre: 'Shorts',
    subtitulo: 'Shorts Jeans, Dril, Cargo y Sueltos',
    descripcion: 'Frescura, soltura y durabilidad para días calurosos o estilo urbano veraniego.',
    imagenHeader: '/cat_short.png',
    badge: 'Frescura & Moda'
  },
  {
    id: 'casacas',
    nombre: 'Casacas',
    subtitulo: 'Casacas Jeans Clásicas & con Peluche Sherpa',
    descripcion: 'Abrigo con actitud denim, diseñadas para durar y destacar en cualquier look.',
    imagenHeader: '/cat_casacas.png',
    badge: 'Outerwear Premium'
  }
];

// TODOS LOS PRODUCTOS TIENEN PRECIOS VACÍOS (UNDEFINED) POR DEFECTO PARA QUE SE INGRESEN DESDE EL GOOGLE SHEETS COMO NÚMEROS SIMPLES
export const JEANS_PRODUCTS: JeansProduct[] = [
  // -------------------------------------------------------------
  // 1. PANTALONES JEANS
  // -------------------------------------------------------------
  {
    id: "pantalon-clasico-jeans",
    categoriaId: "pantalones-jeans",
    marca: "Lois",
    modelo: "Pantalón Clásico Jeans",
    nombreCompleto: "Pantalón Clásico Jeans - Lois Originals",
    corte: "Corte Clásico",
    descripcion: "Jean clásico Lois de bota recta tradicional. Confeccionado en denim puro heavy-duty de alta densidad con el icónico bordado en bolsillo posterior.",
    detalles: [
      "Tejido Denim de alta durabilidad y resistencia",
      "Corte recto tradicional de tiro medio",
      "Insignia mítica Lois Originals",
      "Costura reinforced de doble punto"
    ],
    destacado: true,
    stockLimitado: true,
    tallasDisponibles: [28, 30, 32, 34, 36],
    imagenPoster: "/WhatsApp Image 2026-08-10 at 17.29.44 (3).jpeg",
    colores: [
      { nombre: "Azul Clásico", imagen: "/WhatsApp Image 2026-08-10 at 17.29.42.jpeg", hexColor: "#60a5fa" },
      { nombre: "Negro", imagen: "/WhatsApp Image 2026-08-10 at 17.29.43.jpeg", hexColor: "#1e293b" },
      { nombre: "Plomo Oscuro", imagen: "/WhatsApp Image 2026-08-10 at 17.29.44 (2).jpeg", hexColor: "#475569" }
    ]
  },
  {
    id: "pantalon-semi-pitillo-jeans",
    categoriaId: "pantalones-jeans",
    marca: "Element",
    modelo: "Pantalón Semi Pitillo Jeans",
    nombreCompleto: "Pantalón Semi Pitillo Jeans - Element Comfort",
    corte: "Semi Pitillo",
    descripcion: "Jean Element Semi Pitillo con caída entallada sobria. Equilibrio perfecto entre entalle moderno y total comodidad para calzado casual o deportivo.",
    detalles: [
      "Corte Semi Pitillo estilizado",
      "Línea Element Black Edition Comfort Premium",
      "Lavado de alta resistencia al uso diario",
      "Cinturón textil de obsequio incluido"
    ],
    destacado: true,
    nuevo: true,
    stockLimitado: true,
    tallasDisponibles: [28, 30, 32, 34, 36],
    imagenPoster: "/WhatsApp Image 2026-08-10 at 17.29.45.jpeg",
    colores: [
      { nombre: "Azul Cristal", imagen: "/WhatsApp Image 2026-08-10 at 17.29.45 (1).jpeg", hexColor: "#2563eb" },
      { nombre: "Negro", imagen: "/WhatsApp Image 2026-08-10 at 17.29.45 (2).jpeg", hexColor: "#0f172a" },
      { nombre: "Plomo Claro", imagen: "/WhatsApp Image 2026-08-10 at 17.29.46 (1).jpeg", hexColor: "#cbd5e1" }
    ]
  },
  {
    id: "pantalon-pitillo-jeans",
    categoriaId: "pantalones-jeans",
    marca: "Bronco",
    modelo: "Pantalón Pitillo Jeans",
    nombreCompleto: "Pantalón Pitillo Jeans - Bronco Slim Fit",
    corte: "Slim Fit",
    descripcion: "Jean pitillo ceñido al cuerpo de la marca Bronco. Confeccionado con tejido elástico adaptativo que moldea la pierna sin quitar libertad de movimiento.",
    detalles: [
      "Corte Slim Pitillo de tiro bajo/medio",
      "Elasticidad de alto retorno",
      "Remaches metálicos Bronco USA 1971",
      "Cierre metálico ultra duradero"
    ],
    destacado: false,
    nuevo: true,
    stockLimitado: true,
    tallasDisponibles: [28, 30, 32, 34],
    colores: [
      { nombre: "Negro Stone", imagen: "/WhatsApp Image 2026-08-10 at 17.29.51.jpeg", hexColor: "#1e293b" },
      { nombre: "Azul Pacific", imagen: "/WhatsApp Image 2026-08-10 at 17.29.51 (1).jpeg", hexColor: "#1d4ed8" }
    ]
  },
  {
    id: "pantalon-clasico-strech",
    categoriaId: "pantalones-jeans",
    marca: "Pionier",
    modelo: "Pantalón Clásico en Strech",
    nombreCompleto: "Pantalón Clásico en Strech - Pionier Comfort",
    corte: "Corte Clásico",
    descripcion: "Pantalón clásico de tiro anatómico confeccionado en tela strech ultra suave. El clásico peruano por excelencia con flex flexible para jornadas largas.",
    detalles: [
      "Tecnología Stretch Comfort Pionier",
      "Bota recta ergonométrica tradicional",
      "Garantía de calidad controlada nacional",
      "Costuras de refuerzo en contraste"
    ],
    destacado: true,
    stockLimitado: true,
    tallasDisponibles: [28, 30, 32, 34, 36, 38],
    imagenPoster: "/WhatsApp Image 2026-08-10 at 17.29.46 (5).jpeg",
    colores: [
      { nombre: "Azul Cristal", imagen: "/WhatsApp Image 2026-08-10 at 17.29.47.jpeg", hexColor: "#1d4ed8" },
      { nombre: "Grafito", imagen: "/WhatsApp Image 2026-08-10 at 17.29.47 (1).jpeg", hexColor: "#1e3a8a" },
      { nombre: "Celeste", imagen: "/WhatsApp Image 2026-08-10 at 17.29.48.jpeg", hexColor: "#93c5fd" }
    ]
  },

  // -------------------------------------------------------------
  // 2. PANTALONES DRIL
  // -------------------------------------------------------------
  {
    id: "pantalon-clasico-dril",
    categoriaId: "pantalones-dril",
    marca: "Pionier",
    modelo: "Pantalón Clásico Dril",
    nombreCompleto: "Pantalón Clásico en Algodón Dril",
    corte: "Corte Clásico Dril",
    descripcion: "Pantalón de dril 100% algodón con textura elegante. Ideal para vestimenta casual ejecutiva o combinación con camisas y polos manga corta.",
    detalles: [
      "Tejido dril de tacto suave y fresco",
      "Corte clásico confort de caída limpia",
      "Bolsillos profundos tipo chino",
      "Resistencia a lavados continuos"
    ],
    destacado: true,
    tallasDisponibles: [28, 30, 32, 34, 36],
    colores: [
      { nombre: "Beige Khaki", imagen: "/WhatsApp Image 2026-08-10 at 17.29.48 (2).jpeg", hexColor: "#d4a373" },
      { nombre: "Plomo Ejecutivo", imagen: "/WhatsApp Image 2026-08-10 at 17.29.48 (3).jpeg", hexColor: "#64748b" },
      { nombre: "Negro", imagen: "/WhatsApp Image 2026-08-10 at 17.29.49 (1).jpeg", hexColor: "#0f172a" }
    ]
  },
  {
    id: "pantalon-semi-pitillo-dril",
    categoriaId: "pantalones-dril",
    marca: "Element",
    modelo: "Pantalón SEMI Pitillo Dril",
    nombreCompleto: "Pantalón SEMI Pitillo Dril Urban Comfort",
    corte: "Semi Pitillo Dril",
    descripcion: "Pantalón en dril stretch de silueta semi pitillo. Estiliza las piernas manteniendo soltura y máxima frescura durante todo el día.",
    detalles: [
      "Dril Strech de flex moderada",
      "Diseño semi ajustado moderno",
      "Bolsillos con costura invisible",
      "Ideal para calzado vestir o zapatillas"
    ],
    nuevo: true,
    tallasDisponibles: [28, 30, 32, 34],
    colores: [
      { nombre: "Plomo Claro", imagen: "/WhatsApp Image 2026-08-10 at 17.29.46 (1).jpeg", hexColor: "#cbd5e1" },
      { nombre: "Verdoso Olive", imagen: "/WhatsApp Image 2026-08-10 at 17.29.44.jpeg", hexColor: "#334155" }
    ]
  },
  {
    id: "pantalon-cargo-dril",
    categoriaId: "pantalones-dril",
    marca: "Bronco",
    modelo: "Pantalón Cargo Dril",
    nombreCompleto: "Pantalón Cargo Dril Tactico & Urbano",
    corte: "Cargo Dril",
    descripcion: "Pantalón cargo en dril reforzado con múltiples bolsillos laterales utilitarios. Combinación impecable de robustez, espacio y actitud urbana.",
    detalles: [
      "Bolsillos laterales tipo fuelle con broches",
      "Algodón dril heavy weight de alta resistencia",
      "Cintura reinforced de calce ergonómico",
      "Acabado mate industrial"
    ],
    destacado: true,
    stockLimitado: true,
    tallasDisponibles: [28, 30, 32, 34, 36],
    colores: [
      { nombre: "Verde Olivo", imagen: "/WhatsApp Image 2026-08-10 at 17.29.47 (3).jpeg", hexColor: "#475569" },
      { nombre: "Negro", imagen: "/WhatsApp Image 2026-08-10 at 17.29.43.jpeg", hexColor: "#0f172a" }
    ]
  },

  // -------------------------------------------------------------
  // 3. PANTALONES SUELTOS
  // -------------------------------------------------------------
  {
    id: "pantalon-cargo-jeans",
    categoriaId: "pantalones-sueltos",
    marca: "Element",
    modelo: "Pantalón Cargo Jeans",
    nombreCompleto: "Pantalón Cargo Jeans Loose Fit",
    corte: "Cargo Relajado",
    descripcion: "Cargo en denim puro con bolsillos tipo compartimento en los muslos. Estilo oversized holgado perfecto para la cultura urbana actual.",
    detalles: [
      "Corte holgado / loose fit",
      "Bolsillos de carga amplios",
      "Denim pre-lavado suave al tacto",
      "Costura extra reforzada en entrepierna"
    ],
    destacado: true,
    nuevo: true,
    tallasDisponibles: [28, 30, 32, 34],
    colores: [
      { nombre: "Maíz Acid", imagen: "/WhatsApp Image 2026-08-10 at 17.29.53 (1).jpeg", hexColor: "#bfdbfe" },
      { nombre: "Azul Denim", imagen: "/WhatsApp Image 2026-08-10 at 17.29.53 (2).jpeg", hexColor: "#3b82f6" }
    ]
  },
  {
    id: "bagui-jeans",
    categoriaId: "pantalones-sueltos",
    marca: "Element",
    modelo: "Bagui Jeans",
    nombreCompleto: "Bagui Jeans - Baggy Streetwear Original",
    corte: "Baggy Fit",
    descripcion: "Jean Baggy holgado en caderas y muslos con caída ancha hasta los tobillos. La tendencia noventera reinventada con denim peruano de primer nivel.",
    detalles: [
      "Silueta Baggy / Bagui holgada",
      "Cintura entallada y piernas anchas",
      "100% Algodón de grosor medio",
      "Estilo relajado streetwear"
    ],
    nuevo: true,
    tallasDisponibles: [28, 30, 32, 34, 36],
    colores: [
      { nombre: "Plomo Claro", imagen: "/WhatsApp Image 2026-08-10 at 17.29.50.jpeg", hexColor: "#94a3b8" },
      { nombre: "Plomo Oscuro", imagen: "/WhatsApp Image 2026-08-10 at 17.29.53 (3).jpeg", hexColor: "#475569" }
    ]
  },
  {
    id: "moon-jeans",
    categoriaId: "pantalones-sueltos",
    marca: "Element",
    modelo: "Moon Jeans",
    nombreCompleto: "Moon Jeans - MOM / Moon Fit Urban",
    corte: "Moon Fit / MOM",
    descripcion: "Jean Moon Fit con tiro alto y silueta ligeramente curva en muslos que se estrecha en los tobillos. Aporta soltura, volumen y un toque retro audaz.",
    detalles: [
      "Corte Moon / MOM vintage de tiro alto",
      "Volumen holgado anatómico",
      "Lavado con desgastado artístico",
      "Entalle anatómico en cadera"
    ],
    tallasDisponibles: [28, 30, 32, 34],
    colores: [
      { nombre: "Plomo Intermedio", imagen: "/WhatsApp Image 2026-08-10 at 17.29.53 (4).jpeg", hexColor: "#64748b" },
      { nombre: "Maíz", imagen: "/WhatsApp Image 2026-08-10 at 17.29.53 (1).jpeg", hexColor: "#bfdbfe" }
    ]
  },

  // -------------------------------------------------------------
  // 4. SHORT
  // -------------------------------------------------------------
  {
    id: "short-jeans",
    categoriaId: "short",
    marca: "Lois",
    modelo: "Short Jeans",
    nombreCompleto: "Short Jeans - Lois Summer Edition",
    corte: "Short Denim",
    descripcion: "Bermuda / Short en denim stretch con acabado deshilachado o doblado. Ideal para días soleados y outfit casual relajado.",
    detalles: [
      "Denim stretch liviano de gran movilidad",
      "Parche e insignias originales Lois",
      "Bolsillos clásicos de 5 puntos",
      "Largo cómodo por encima de la rodilla"
    ],
    destacado: true,
    tallasDisponibles: [28, 30, 32, 34, 36],
    colores: [
      { nombre: "Celeste Summer", imagen: "/WhatsApp Image 2026-08-10 at 17.29.42.jpeg", hexColor: "#60a5fa" },
      { nombre: "Azul Vintage", imagen: "/WhatsApp Image 2026-08-10 at 17.29.44 (3).jpeg", hexColor: "#2563eb" }
    ]
  },
  {
    id: "short-dril",
    categoriaId: "short",
    marca: "Pionier",
    modelo: "Short Dril",
    nombreCompleto: "Short Dril Chino Confort",
    corte: "Short Dril Chino",
    descripcion: "Short estilo chino confeccionado en algodón dril peinado. Fresco, elegante y extremadamente suave al contacto con la piel.",
    detalles: [
      "Algodón dril suave de secado rápido",
      "Bolsillos laterales profundos",
      "Pretina confort con ajuste perfecto",
      "Estilo casual elegante"
    ],
    tallasDisponibles: [28, 30, 32, 34, 36],
    colores: [
      { nombre: "Beige Khaki", imagen: "/WhatsApp Image 2026-08-10 at 17.29.48 (2).jpeg", hexColor: "#d4a373" },
      { nombre: "Plomo", imagen: "/WhatsApp Image 2026-08-10 at 17.29.48 (3).jpeg", hexColor: "#64748b" }
    ]
  },
  {
    id: "short-cargo",
    categoriaId: "short",
    marca: "Bronco",
    modelo: "Short Cargo",
    nombreCompleto: "Short Cargo Utilitario Dril & Denim",
    corte: "Short Cargo",
    descripcion: "Bermuda cargo con múltiples bolsillos tácticos. Diseñada para actividades al aire libre o un estilo urbano desenfadado.",
    detalles: [
      "Bolsillos de fuelle laterales con tapa",
      "Tejido reforzado anti-desgarro",
      "Pasadores de correa anchos",
      "Remaches de metal pavonado"
    ],
    nuevo: true,
    tallasDisponibles: [28, 30, 32, 34, 36],
    colores: [
      { nombre: "Verde Olivo", imagen: "/WhatsApp Image 2026-08-10 at 17.29.47 (3).jpeg", hexColor: "#475569" },
      { nombre: "Negro", imagen: "/WhatsApp Image 2026-08-10 at 17.29.43.jpeg", hexColor: "#0f172a" }
    ]
  },
  {
    id: "short-suelto",
    categoriaId: "short",
    marca: "Element",
    modelo: "Short Suelto",
    nombreCompleto: "Short Suelto Relaxed Fit",
    corte: "Short Holgado",
    descripcion: "Short de pierna ancha y holgada para total ventilación y libertad de movimiento. La prenda indispensable del verano urbano.",
    detalles: [
      "Corte ancho en pierna",
      "Lavado suave acid wash",
      "Cintura flexible",
      "Máximo confort en climas cálidos"
    ],
    tallasDisponibles: [28, 30, 32, 34],
    colores: [
      { nombre: "Maíz Soft", imagen: "/WhatsApp Image 2026-08-10 at 17.29.52.jpeg", hexColor: "#7dd3fc" },
      { nombre: "Hielo", imagen: "/WhatsApp Image 2026-08-10 at 17.29.46 (4).jpeg", hexColor: "#93c5fd" }
    ]
  },
  {
    id: "short-clasico-jeans",
    categoriaId: "short",
    marca: "Pionier",
    modelo: "Short Clásico Jeans",
    nombreCompleto: "Short Clásico Jeans - Pionier Heritage",
    corte: "Short Clásico",
    descripcion: "Short de jean tradicional Pionier con bota recta clásica y durabilidad legendaria en denim puro.",
    detalles: [
      "Denim 100% Algodón Pionier",
      "Corte clásico sobrio de bota recta",
      "Costura reforzada",
      "Bolsillo relojero tradicional"
    ],
    tallasDisponibles: [28, 30, 32, 34, 36],
    colores: [
      { nombre: "Azul Cristal", imagen: "/WhatsApp Image 2026-08-10 at 17.29.49.jpeg", hexColor: "#1d4ed8" },
      { nombre: "Acero", imagen: "/WhatsApp Image 2026-08-10 at 17.29.49 (2).jpeg", hexColor: "#1e3a8a" }
    ]
  },

  // -------------------------------------------------------------
  // 5. CASACAS
  // -------------------------------------------------------------
  {
    id: "casaca-jeans",
    categoriaId: "casacas",
    marca: "Lois",
    modelo: "Casaca Jeans",
    nombreCompleto: "Casaca Jeans - Lois Trucker Original",
    corte: "Casaca Denim",
    descripcion: "Casaca de jean modelo Trucker icónico de Lois. Elaborada en denim rígido de alto gramaje con solapas pectorales y ajustadores laterales.",
    detalles: [
      "Estructura Trucker icónica vintage",
      "Botonera metálica con grabado Lois",
      "Bolsillos superiores con tapa y solapa",
      "Corte anatómico favorecedor"
    ],
    destacado: true,
    tallasDisponibles: ["S", "M", "L", "XL"],
    imagenPoster: "/WhatsApp Image 2026-08-10 at 17.29.45.jpeg",
    colores: [
      { nombre: "Azul Clásico", imagen: "/WhatsApp Image 2026-08-10 at 17.29.42.jpeg", hexColor: "#2563eb" },
      { nombre: "Negro Stone", imagen: "/WhatsApp Image 2026-08-10 at 17.29.43.jpeg", hexColor: "#0f172a" }
    ]
  },
  {
    id: "casaca-peluche-jeans",
    categoriaId: "casacas",
    marca: "Bronco",
    modelo: "Casaca con Peluche Jeans",
    nombreCompleto: "Casaca Jeans con Peluche Sherpa",
    corte: "Casaca Sherpa Warm",
    descripcion: "Casaca de jean acolchada con cuello e interior en peluche / sherpa blanco térmico. El abrigo imprescindible con máximo impacto visual y calidez.",
    detalles: [
      "Forro interior y cuello de sherpa/peluche ultra suave",
      "Cuerpo de denim resistente anti-viento",
      "Bolsillos térmicos reposamanos",
      "Broches de presión reinforced"
    ],
    destacado: true,
    nuevo: true,
    stockLimitado: true,
    tallasDisponibles: ["S", "M", "L", "XL"],
    colores: [
      { nombre: "Azul Winter", imagen: "/WhatsApp Image 2026-08-10 at 17.29.45 (1).jpeg", hexColor: "#1d4ed8" },
      { nombre: "Negro Deep", imagen: "/WhatsApp Image 2026-08-10 at 17.29.45 (2).jpeg", hexColor: "#0f172a" }
    ]
  }
];

export const STORE_INFO = {
  nombre: "PLUMAS JEANS",
  slogan: "Catálogo Digital Exclusivo de Jeans & Moda Premium",
  telefonoWhatsApp: "51970810966",
  mensajeWhatsAppBase: "¡Hola Plumas Jeans! Vengo de su catálogo digital y deseo información sobre:",
  envios: "Envíos a todo el Perú (Olva Courier, Shalom, Agencia)",
  garantia: "100% Calidad Garantizada & Cambio de Talla",
  marcas: ["Lois", "Element", "Pionier", "Bronco"]
};
