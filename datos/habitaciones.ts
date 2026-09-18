export type Habitacion = {
  id: string;
  name: string;
  description: string;
  pricePerNight: number;
  capacity: number;
  imageUrl: string;
  /** Detalles extra para el modal */
  highlights: string[];
};

/**
 * Precios de referencia en USD (mercado hotel de playa Centroamérica).
 * Datos temporales (mock); luego se reemplazan por la API REST.
 */
export const HABITACIONES_DESTACADAS: Habitacion[] = [
  {
    id: "basica",
    name: "Básica",
    description:
      "Habitación luminosa con cama king, ropa de cama blanca y balcón con vista al mar. Incluye escritorio de trabajo, sillón de lectura, TV y lámpara de fibras naturales para un descanso sencillo frente a la playa.",
    pricePerNight: 89,
    capacity: 2,
    imageUrl: "/imagenes/habitaciones/Hbasica.jpg",
    highlights: [
      "Cama king y ropa de cama premium",
      "Balcón con vista al mar",
      "Escritorio y sillón de lectura",
      "TV y Wi‑Fi",
      "Ideal para 1–2 personas",
    ],
  },
  {
    id: "intermedia",
    name: "Intermedia",
    description:
      "Dos camas queen con detalles en teal, pared decorativa y minibar. Ideal para amigos o pareja: iluminación cálida, cortinas amplias y un ambiente boutique listo para noches cómodas después de la playa.",
    pricePerNight: 129,
    capacity: 4,
    imageUrl: "/imagenes/habitaciones/Hintermedia.jpg",
    highlights: [
      "Dos camas queen",
      "Minibar incluido",
      "Decoración boutique con acentos teal",
      "Iluminación cálida y cortinas amplias",
      "Ideal para amigos o pareja",
    ],
  },
  {
    id: "familiar",
    name: "Familiar",
    description:
      "Espacio amplio con tres camas queen, panel de madera, aire acondicionado y TV. Decoración costera, mesitas de noche y cómoda larga: pensada para que toda la familia descanse en la misma habitación.",
    pricePerNight: 189,
    capacity: 6,
    imageUrl: "/imagenes/habitaciones/Hfamiliar.jpg",
    highlights: [
      "Tres camas queen",
      "Aire acondicionado",
      "TV de pantalla grande",
      "Mucho espacio para familias",
      "Hasta 6 personas",
    ],
  },
  {
    id: "kids",
    name: "Kids",
    description:
      "Habitación temática náutica/pirata con cabecera de velero, litera tipo barco con ojos de buey y escritorio infantil. Piso y colores vivos pensados para que los niños vivan la aventura desde que llegan.",
    pricePerNight: 199,
    capacity: 3,
    imageUrl: "/imagenes/habitaciones/Hkids.jpg",
    highlights: [
      "Temática náutica / pirata",
      "Litera tipo barco con ojos de buey",
      "Escritorio infantil",
      "Ambiente divertido y seguro",
      "Pensada para familias con niños",
    ],
  },
  {
    id: "vip",
    name: "VIP",
    description:
      "Suite semi lujo con vista panorámica al océano, balcón privado, escritorio de mármol y pared tropical. Acabados en madera y piedra, TV de gran formato y zona de comedor para elevar tu estancia.",
    pricePerNight: 279,
    capacity: 3,
    imageUrl: "/imagenes/habitaciones/Hsuiteslujo.jpg",
    highlights: [
      "Vista panorámica al océano",
      "Balcón privado",
      "Escritorio de mármol",
      "Zona de comedor interior",
      "Acabados en madera y piedra",
    ],
  },
  {
    id: "platinum",
    name: "Platinum",
    description:
      "La categoría tope del hotel: terraza privada con plunge pool, vista abierta al mar, cama king, área de estar y acabados en mármol. Experiencia premium sin igual.",
    pricePerNight: 399,
    capacity: 2,
    imageUrl: "/imagenes/habitaciones/Hvip.jpg",
    highlights: [
      "Terraza privada con plunge pool",
      "Vista abierta al mar",
      "Cama king y área de estar",
      "Acabados en mármol",
      "La categoría más exclusiva",
    ],
  },
];
