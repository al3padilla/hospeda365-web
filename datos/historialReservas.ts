export type EstadoReserva = "confirmada" | "pendiente" | "cancelada";

export type ReservaHistorial = {
  id: string;
  habitacionNombre: string;
  imagenUrl: string;
  checkIn: string;
  checkOut: string;
  total: number;
  estado: EstadoReserva;
  adultos: number;
  ninos: number;
  bebes: number;
  precioPorNoche: number;
};

/* Mock del historial del huésped */
export const RESERVAS_HISTORIAL: ReservaHistorial[] = [
  {
    id: "res-001",
    habitacionNombre: "Platinum",
    imagenUrl: "/imagenes/habitaciones/Hvip.jpg",
    checkIn: "2026-10-12",
    checkOut: "2026-10-15",
    total: 1197,
    estado: "confirmada",
    adultos: 2,
    ninos: 0,
    bebes: 0,
    precioPorNoche: 399,
  },
  {
    id: "res-002",
    habitacionNombre: "Familiar",
    imagenUrl: "/imagenes/habitaciones/Hfamiliar.jpg",
    checkIn: "2026-11-01",
    checkOut: "2026-11-04",
    total: 567,
    estado: "pendiente",
    adultos: 2,
    ninos: 2,
    bebes: 0,
    precioPorNoche: 189,
  },
  {
    id: "res-003",
    habitacionNombre: "VIP",
    imagenUrl: "/imagenes/habitaciones/Hsuiteslujo.jpg",
    checkIn: "2026-08-20",
    checkOut: "2026-08-22",
    total: 558,
    estado: "confirmada",
    adultos: 2,
    ninos: 0,
    bebes: 1,
    precioPorNoche: 279,
  },
  {
    id: "res-004",
    habitacionNombre: "Intermedia",
    imagenUrl: "/imagenes/habitaciones/Hintermedia.jpg",
    checkIn: "2026-07-10",
    checkOut: "2026-07-12",
    total: 258,
    estado: "cancelada",
    adultos: 2,
    ninos: 0,
    bebes: 0,
    precioPorNoche: 129,
  },
  {
    id: "res-005",
    habitacionNombre: "Kids",
    imagenUrl: "/imagenes/habitaciones/Hkids.jpg",
    checkIn: "2026-12-20",
    checkOut: "2026-12-24",
    total: 796,
    estado: "pendiente",
    adultos: 2,
    ninos: 2,
    bebes: 1,
    precioPorNoche: 199,
  },
  {
    id: "res-006",
    habitacionNombre: "Básica",
    imagenUrl: "/imagenes/habitaciones/Hbasica.jpg",
    checkIn: "2026-06-01",
    checkOut: "2026-06-03",
    total: 178,
    estado: "cancelada",
    adultos: 1,
    ninos: 0,
    bebes: 0,
    precioPorNoche: 89,
  },
];
