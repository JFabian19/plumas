export interface Dish {
  nombre: string;
  descripcion?: string;
  imagen?: string;
  precio: string;
}

export interface Category {
  id: string;
  nombre: string;
  items: Dish[];
}

export const DEFAULT_MENU_DATA: Category[] = [
  {
    id: "ceviches-y-leche-de-tigre",
    nombre: "Ceviches y Leche de Tigre",
    items: [
      {
        nombre: "Ceviche Económico",
        descripcion: "Presentación económica de ceviche de la casa elaborado con la pesca del día y sazón marina.",
        precio: "S/. 20.00",
        imagen: ""
      },
      {
        nombre: "Ceviche Especial",
        descripcion: "Presentación especial de ceviche de la casa bien servido con porción generosa e ingredientes seleccionados.",
        precio: "S/. 25.00",
        imagen: ""
      },
      {
        nombre: "Leche de Tigre Clásica",
        descripcion: "Preparación cítrica y concentrada elaborada con la base tradicional del ceviche.",
        precio: "S/. 10.00",
        imagen: ""
      },
      {
        nombre: "Leche de Tigre Especial",
        descripcion: "Versión especial de leche de tigre concentrada, contundente y llena de sabor marina.",
        precio: "S/. 15.00",
        imagen: ""
      }
    ]
  },
  {
    id: "duos-marinos",
    nombre: "Dúos Marinos",
    items: [
      {
        nombre: "Ceviche con Arroz con Mariscos (Económico)",
        descripcion: "Dúo compuesto por una porción de ceviche fresco y delicioso arroz preparado con mariscos.",
        precio: "S/. 20.00",
        imagen: ""
      },
      {
        nombre: "Ceviche con Arroz con Mariscos (Especial)",
        descripcion: "Dúo especial bien servido de ceviche fresco y jugoso arroz preparado con selección de mariscos.",
        precio: "S/. 25.00",
        imagen: ""
      },
      {
        nombre: "Ceviche con Chaufa de Mariscos (Económico)",
        descripcion: "Dúo compuesto por una porción de ceviche y arroz chaufa salteado con mariscos.",
        precio: "S/. 20.00",
        imagen: ""
      },
      {
        nombre: "Ceviche con Chaufa de Mariscos (Especial)",
        descripcion: "Dúo especial bien servido de ceviche fresco y arroz chaufa oriental salteado con mariscos.",
        precio: "S/. 25.00",
        imagen: ""
      },
      {
        nombre: "Ceviche con Chicharrón de Pescado (Económico)",
        descripcion: "Dúo compuesto por ceviche fresco y trozos de pescado sazonados y fritos hasta quedar crocantes.",
        precio: "S/. 20.00",
        imagen: ""
      },
      {
        nombre: "Ceviche con Chicharrón de Pescado (Especial)",
        descripcion: "Dúo especial bien servido de ceviche fresco y trozos crocantes de chicharrón de pescado.",
        precio: "S/. 27.00",
        imagen: ""
      },
      {
        nombre: "Ceviche con Chicharrón de Pota (Económico)",
        descripcion: "Dúo compuesto por ceviche y trozos de pota sazonados y fritos al punto exacto.",
        precio: "S/. 20.00",
        imagen: ""
      },
      {
        nombre: "Ceviche con Chicharrón de Pota (Especial)",
        descripcion: "Dúo especial bien servido de ceviche fresco y chicharrón de pota súper crocante.",
        precio: "S/. 25.00",
        imagen: ""
      },
      {
        nombre: "Ceviche con Chicharrón Mixto (Económico)",
        descripcion: "Dúo compuesto por ceviche fresco y una combinación sabrosa de mariscos fritos.",
        precio: "S/. 22.00",
        imagen: ""
      },
      {
        nombre: "Ceviche con Chicharrón Mixto (Especial)",
        descripcion: "Dúo especial contundente de ceviche con chicharrón mixto de mariscos crocantes.",
        precio: "S/. 27.00",
        imagen: ""
      }
    ]
  },
  {
    id: "extras-marinos",
    nombre: "Extras Marinos",
    items: [
      {
        nombre: "Arroz con Mariscos",
        descripcion: "Arroz sazonado y preparado con una sabrosa selección de mariscos frescos.",
        precio: "S/. 20.00",
        imagen: ""
      },
      {
        nombre: "Chaufa de Mariscos",
        descripcion: "Arroz chaufa salteado en wok a fuego alto con mariscos y sazón oriental.",
        precio: "S/. 20.00",
        imagen: ""
      },
      {
        nombre: "Chicharrón de Pescado",
        descripcion: "Trozos de pescado sazonados y fritos hasta obtener una textura dorada y crocante.",
        precio: "S/. 22.00",
        imagen: ""
      },
      {
        nombre: "Chicharrón de Pota",
        descripcion: "Trozos de pota sazonados y fritos al momento hasta quedar súper crocantes.",
        precio: "S/. 18.00",
        imagen: ""
      },
      {
        nombre: "Chicharrón Mixto",
        descripcion: "Combinación crocante de variedad de mariscos y pescado fritos.",
        precio: "S/. 22.00",
        imagen: ""
      }
    ]
  },
  {
    id: "duos-con-leche-de-tigre",
    nombre: "Dúos con Leche de Tigre",
    items: [
      {
        nombre: "Leche de Tigre con Arroz con Mariscos",
        descripcion: "Dúo compuesto por una porción de leche de tigre y arroz preparado con mariscos.",
        precio: "S/. 20.00",
        imagen: ""
      },
      {
        nombre: "Leche de Tigre con Chaufa de Mariscos",
        descripcion: "Dúo compuesto por una porción de leche de tigre y arroz chaufa salteado con mariscos.",
        precio: "S/. 20.00",
        imagen: ""
      },
      {
        nombre: "Leche de Tigre con Chicharrón de Pota",
        descripcion: "Dúo compuesto por una porción de leche de tigre y chicharrón crocante de pota.",
        precio: "S/. 20.00",
        imagen: ""
      },
      {
        nombre: "Leche de Tigre con Chicharrón de Pescado",
        descripcion: "Dúo compuesto por una porción de leche de tigre y trozos crocantes de pescado.",
        precio: "S/. 22.00",
        imagen: ""
      },
      {
        nombre: "Leche de Tigre con Chicharrón Mixto",
        descripcion: "Dúo compuesto por una porción de leche de tigre y una combinación de productos marinos fritos.",
        precio: "S/. 22.00",
        imagen: ""
      }
    ]
  },
  {
    id: "informacion-del-negocio",
    nombre: "Información del Negocio",
    items: [
      {
        nombre: "Chilcano de Cortesía",
        descripcion: "La casa te engríe: todos los pedidos se sirven con un chilcano de cortesía refrescante.",
        precio: "Cortesía",
        imagen: ""
      },
      {
        nombre: "Medios de Pago",
        descripcion: "Aceptamos pagos rápidos y seguros mediante Yape, Plin y tarjetas Visa.",
        precio: "Yape / Visa",
        imagen: ""
      }
    ]
  }
];
