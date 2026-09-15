export type Habitacion = {
  id: string;
  name: string;
  description: string;
  pricePerNight: number;
  capacity: number;
  imageUrl: string;
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
  },
  {
    id: "intermedia",
    name: "Intermedia",
    description:
      "Dos camas queen con detalles en teal, pared decorativa y minibar. Ideal para amigos o pareja: iluminación cálida, cortinas amplias y un ambiente boutique listo para noches cómodas después de la playa.",
    pricePerNight: 129,
    capacity: 4,
    imageUrl: "/imagenes/habitaciones/Hintermedia.jpg",
  },
  {
    id: "familiar",
    name: "Familiar",
    description:
      "Espacio amplio con tres camas queen, panel de madera, aire acondicionado y TV. Decoración costera, mesitas de noche y cómoda larga: pensada para que toda la familia descanse en la misma habitación.",
    pricePerNight: 189,
    capacity: 6,
    imageUrl: "/imagenes/habitaciones/Hfamiliar.jpg",
  },
  {
    id: "kids",
    name: "Kids",
    description:
      "Habitación temática náutica/pirata con cabecera de velero, litera tipo barco con ojos de buey y escritorio infantil. Piso y colores vivos pensados para que los niños vivan la aventura desde que llegan.",
    pricePerNight: 199,
    capacity: 3,
    imageUrl: "/imagenes/habitaciones/Hkids.jpg",
  },
  {
    id: "junior-suite",
    name: "Junior Suite",
    description:
      "Suite de lujo con vista panorámica al océano, balcón privado, escritorio de mármol y pared tropical. Acabados en madera y piedra, TV de gran formato y zona de comedor para una estancia más exclusiva.",
    pricePerNight: 279,
    capacity: 3,
    imageUrl: "/imagenes/habitaciones/Hsuiteslujo.jpg",
  },
  {
    id: "vip",
    name: "VIP",
    description:
      "Suite premium con terraza privada, plunge pool y vista abierta al mar. Cama king, área de estar, puertas de piso a techo y acabados en mármol: la opción más exclusiva del hotel.",
    pricePerNight: 399,
    capacity: 2,
    imageUrl: "/imagenes/habitaciones/Hvip.jpg",
  },
];
