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
