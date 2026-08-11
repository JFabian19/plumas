export interface ColorVariant {
  nombre: string;
  imagen: string;
  hexColor: string;
}

export interface JeansProduct {
  id: string;
  marca: 'Lois' | 'Element' | 'Pionier' | 'Bronco';
  modelo: string;
  nombreCompleto: string;
  corte: 'Slim Fit' | 'Semi Pitillo' | 'MOM Jeans' | 'Corte Clásico';
  precio: number;
  precioOriginal?: number;
  descripcion: string;
  detalles: string[];
  destacado?: boolean;
  nuevo?: boolean;
  stockLimitado?: boolean;
  tallasDisponibles: number[];
  imagenPoster?: string;
  colores: ColorVariant[];
}

export const LOGO_IMAGE = "/WhatsApp Image 2026-08-10 at 17.29.49 (3).jpeg";
export const SHOWCASE_MODEL_IMAGE = "/WhatsApp Image 2026-08-10 at 17.29.53.jpeg";

export const MARQUEE_ANNOUNCEMENT = "🪶 PLUMAS JEANS • TIENDA OFICIAL DE JEANS PREMIUM • LOIS, ELEMENT, PIONIER, BRONCO • ENVÍOS RÁPIDOS A TODO EL PERÚ • TALLAS 28 A 36 ⚡ STOCK LIMITADO 🪶";

export const JEANS_PRODUCTS: JeansProduct[] = [
  {
    id: "lois-sevilla-slim",
    marca: "Lois",
    modelo: "Sevilla Slim",
    nombreCompleto: "Lois Originals - Sevilla Slim",
    corte: "Slim Fit",
    precio: 169.90,
    precioOriginal: 199.90,
    descripcion: "Jean Lois Originals modelo Sevilla Slim. Confeccionado en denim stretch premium de alta densidad, tiro medio y pierna ceñida elegante con el icónico toro Lois bordado en bolsillo posterior.",
    detalles: [
      "Tela Denim Stretch de alta elasticidad y retorno",
      "Corte Sevilla Slim ceñido al cuerpo sin apretar",
      "Insignia clásica Lois Originals y parche retro",
      "Remaches de aleación antioxidante",
      "Construcción de costura reforzada de doble punto"
    ],
    destacado: true,
    stockLimitado: true,
    tallasDisponibles: [28, 30, 32, 34, 36],
    imagenPoster: "/WhatsApp Image 2026-08-10 at 17.29.44 (3).jpeg",
    colores: [
      {
        nombre: "Celeste",
        imagen: "/WhatsApp Image 2026-08-10 at 17.29.42.jpeg",
        hexColor: "#60a5fa"
      },
      {
        nombre: "Negro",
        imagen: "/WhatsApp Image 2026-08-10 at 17.29.43.jpeg",
        hexColor: "#1e293b"
      },
      {
        nombre: "Verdoso",
        imagen: "/WhatsApp Image 2026-08-10 at 17.29.44.jpeg",
        hexColor: "#334155"
      },
      {
        nombre: "Plomo Claro",
        imagen: "/WhatsApp Image 2026-08-10 at 17.29.44 (1).jpeg",
        hexColor: "#94a3b8"
      },
      {
        nombre: "Plomo Oscuro",
        imagen: "/WhatsApp Image 2026-08-10 at 17.29.44 (2).jpeg",
        hexColor: "#475569"
      }
    ]
  },
  {
    id: "element-semi-pitillo",
    marca: "Element",
    modelo: "Semi Pitillo Black Edition",
    nombreCompleto: "Element Jeans - Semi Pitillo (Black Edition)",
    corte: "Semi Pitillo",
    precio: 169.00,
    precioOriginal: 189.90,
    descripcion: "Jean Element Black Edition de la línea Comfort Premium. Incluye cinturón/correa textil distintiva. Diseñado para un estilo urbano moderno con caída impecable y acabado ultra suave.",
    detalles: [
      "Incluye correa textil de regalo/estilo integrada",
      "Línea Element Black Edition Comfort Premium",
      "Corte Semi Pitillo ideal para zapato casual o zapatillas",
      "Lavado ecológico de alta durabilidad",
      "Etiqueta de cuero genuino en cintura"
    ],
    destacado: true,
    nuevo: true,
    stockLimitado: true,
    tallasDisponibles: [28, 30, 32, 34, 36],
    imagenPoster: "/WhatsApp Image 2026-08-10 at 17.29.45.jpeg",
    colores: [
      {
        nombre: "Azul Cristal",
        imagen: "/WhatsApp Image 2026-08-10 at 17.29.45 (1).jpeg",
        hexColor: "#2563eb"
      },
      {
        nombre: "Negro",
        imagen: "/WhatsApp Image 2026-08-10 at 17.29.45 (2).jpeg",
        hexColor: "#0f172a"
      },
      {
        nombre: "Grafito",
        imagen: "/WhatsApp Image 2026-08-10 at 17.29.46.jpeg",
        hexColor: "#1e1b4b"
      },
      {
        nombre: "Plomo Claro",
        imagen: "/WhatsApp Image 2026-08-10 at 17.29.46 (1).jpeg",
        hexColor: "#cbd5e1"
      },
      {
        nombre: "Plomo",
        imagen: "/WhatsApp Image 2026-08-10 at 17.29.46 (2).jpeg",
        hexColor: "#64748b"
      },
      {
        nombre: "Plomo Oscuro",
        imagen: "/WhatsApp Image 2026-08-10 at 17.29.46 (3).jpeg",
        hexColor: "#334155"
      },
      {
        nombre: "Hielo",
        imagen: "/WhatsApp Image 2026-08-10 at 17.29.46 (4).jpeg",
        hexColor: "#93c5fd"
      },
      {
        nombre: "Maíz",
        imagen: "/WhatsApp Image 2026-08-10 at 17.29.52.jpeg",
        hexColor: "#7dd3fc"
      }
    ]
  },
  {
    id: "element-mom-jeans",
    marca: "Element",
    modelo: "MOM Jeans",
    nombreCompleto: "Element Jeans - MOM Fit Urban Wash",
    corte: "MOM Jeans",
    precio: 159.00,
    precioOriginal: 179.00,
    descripcion: "Tendencia vintage irresistible. MOM Jeans Element con tiro alto, estructura relajada en caderas y silueta cónica estilizada. Elaborado en algodón denim con lavado acid wash texturizado.",
    detalles: [
      "Corte MOM Fit de tiro alto vintage",
      "Tejido denim 100% algodón de alta resistencia",
      "Textura suave al tacto con desgastado artístico",
      "Bolsillos profundos y tiro anatómico cómodo",
      "Excelente entalle en la parte posterior"
    ],
    destacado: false,
    nuevo: true,
    stockLimitado: true,
    tallasDisponibles: [28, 30, 32, 34],
    colores: [
      {
        nombre: "Plomo Claro",
        imagen: "/WhatsApp Image 2026-08-10 at 17.29.50.jpeg",
        hexColor: "#94a3b8"
      },
      {
        nombre: "Maíz",
        imagen: "/WhatsApp Image 2026-08-10 at 17.29.53 (1).jpeg",
        hexColor: "#bfdbfe"
      },
      {
        nombre: "Madera",
        imagen: "/WhatsApp Image 2026-08-10 at 17.29.53 (2).jpeg",
        hexColor: "#3b82f6"
      },
      {
        nombre: "Plomo Oscuro",
        imagen: "/WhatsApp Image 2026-08-10 at 17.29.53 (3).jpeg",
        hexColor: "#475569"
      },
      {
        nombre: "Plomo Intermedio",
        imagen: "/WhatsApp Image 2026-08-10 at 17.29.53 (4).jpeg",
        hexColor: "#64748b"
      }
    ]
  },
  {
    id: "pionier-semi-pitillo",
    marca: "Pionier",
    modelo: "Semi-Pitillo Comfort",
    nombreCompleto: "Pionier Jeans - Semi-Pitillo Comfort",
    corte: "Semi Pitillo",
    precio: 189.00,
    precioOriginal: 219.00,
    descripcion: "Icono nacional del denim peruano desde 1979. Pionier Semi-Pitillo Comfort con tecnología de ajuste anatómico 'Double Controlled Quality'. Garantiza máxima frescura, resistencia al lavado y libertad de movimiento.",
    detalles: [
      "Tecnología Comfort Jeans: conserva su forma original",
      "Tiro Medio / Bota Semi Recta ergonométrica",
      "Fabricación de calidad controlada desde 1979",
      "Costuras reforzadas en contraste dorado",
      "Etiqueta de cuero Pionier de lujo"
    ],
    destacado: true,
    stockLimitado: true,
    tallasDisponibles: [28, 30, 32, 34, 36],
    imagenPoster: "/WhatsApp Image 2026-08-10 at 17.29.46 (5).jpeg",
    colores: [
      {
        nombre: "Azul Cristal",
        imagen: "/WhatsApp Image 2026-08-10 at 17.29.47.jpeg",
        hexColor: "#1d4ed8"
      },
      {
        nombre: "Grafito",
        imagen: "/WhatsApp Image 2026-08-10 at 17.29.47 (1).jpeg",
        hexColor: "#1e3a8a"
      },
      {
        nombre: "Maíz",
        imagen: "/WhatsApp Image 2026-08-10 at 17.29.47 (2).jpeg",
        hexColor: "#60a5fa"
      },
      {
        nombre: "Verdoso",
        imagen: "/WhatsApp Image 2026-08-10 at 17.29.47 (3).jpeg",
        hexColor: "#2563eb"
      },
      {
        nombre: "Celeste",
        imagen: "/WhatsApp Image 2026-08-10 at 17.29.48.jpeg",
        hexColor: "#93c5fd"
      }
    ]
  },
  {
    id: "pionier-corte-clasico",
    marca: "Pionier",
    modelo: "Corte Clásico Original",
    nombreCompleto: "Pionier Jeans - Corte Clásico Original",
    corte: "Corte Clásico",
    precio: 179.00,
    precioOriginal: 199.00,
    descripcion: "El genuino jean clásico Pionier de bota recta tradicional. Confeccionado en denim puro de durabilidad extrema, pensado para el caballero elegante que busca solidez, confort tradicional y prestancia.",
    detalles: [
      "Corte Clásico Original de bota recta tradicional",
      "Denim 100% algodón heavy-duty de alta resistencia",
      "Placa/pin Pionier y etiquetas clásicas amarillas",
      "Costura triple en tiros para resistencia superior",
      "Diseño atemporal de gran versatilidad"
    ],
    destacado: false,
    stockLimitado: true,
    tallasDisponibles: [28, 30, 32, 34, 36, 38],
    imagenPoster: "/WhatsApp Image 2026-08-10 at 17.29.48 (1).jpeg",
    colores: [
      {
        nombre: "Plomo",
        imagen: "/WhatsApp Image 2026-08-10 at 17.29.48 (2).jpeg",
        hexColor: "#475569"
      },
      {
        nombre: "Celeste",
        imagen: "/WhatsApp Image 2026-08-10 at 17.29.48 (3).jpeg",
        hexColor: "#60a5fa"
      },
      {
        nombre: "Azul Cristal",
        imagen: "/WhatsApp Image 2026-08-10 at 17.29.49.jpeg",
        hexColor: "#1d4ed8"
      },
      {
        nombre: "Negro",
        imagen: "/WhatsApp Image 2026-08-10 at 17.29.49 (1).jpeg",
        hexColor: "#0f172a"
      },
      {
        nombre: "Acero",
        imagen: "/WhatsApp Image 2026-08-10 at 17.29.49 (2).jpeg",
        hexColor: "#1e3a8a"
      },
      {
        nombre: "Verdoso",
        imagen: "/WhatsApp Image 2026-08-10 at 17.29.52 (1).jpeg",
        hexColor: "#1e293b"
      },
      {
        nombre: "Grafito",
        imagen: "/WhatsApp Image 2026-08-10 at 17.29.52 (2).jpeg",
        hexColor: "#090d16"
      }
    ]
  },
  {
    id: "bronco-tukson-slim",
    marca: "Bronco",
    modelo: "Tukson Slim Fit Comfort",
    nombreCompleto: "Bronco Jeans - Tukson Slim Fit (USA 1971)",
    corte: "Slim Fit",
    precio: 169.90,
    precioOriginal: 199.90,
    descripcion: "Jean Bronco modelo Tukson Slim Fit Comfort. Inspirado en la mística americana Denver Colorado 1971. Destaca por su estampa fuerte, remaches grabados y tela stretch de flexibilidad absoluta.",
    detalles: [
      "Sello original Bronco USA 1971 Denver Colorado",
      "Corte Tukson Slim Fit de ajuste ideal",
      "Parche trasero en cuero en relieve rústico",
      "Cierre YKK metálico duradero",
      "Resistencia extrema al uso continuo y lavados"
    ],
    destacado: true,
    nuevo: true,
    stockLimitado: true,
    tallasDisponibles: [28, 30, 32, 34, 36],
    colores: [
      {
        nombre: "Negro Stone",
        imagen: "/WhatsApp Image 2026-08-10 at 17.29.51.jpeg",
        hexColor: "#1e293b"
      },
      {
        nombre: "Azul Pacific",
        imagen: "/WhatsApp Image 2026-08-10 at 17.29.51 (1).jpeg",
        hexColor: "#1d4ed8"
      }
    ]
  }
];

export const STORE_INFO = {
  nombre: "PLUMAS JEANS",
  slogan: "Catálogo Digital Exclusivo de Jeans Premium",
  telefonoWhatsApp: "51993399915",
  mensajeWhatsAppBase: "¡Hola Plumas Jeans! Vengo de su catálogo digital y deseo información sobre:",
  envios: "Envíos a todo el Perú (Olva Courier, Shalom, Agencia)",
  garantia: "100% Calidad Garantizada & Cambio de Talla",
  marcas: ["Lois", "Element", "Pionier", "Bronco"]
};
