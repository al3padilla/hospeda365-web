export type EstadoReserva = "confirmada" | "pendiente" | "cancelada" | "rechazada";

export type ReservaHistorial = {
  id: string;
  habitacionNombre: string;
  imagenUrl: string;
  checkIn: string;
  checkOut: string;
  total: number;
  estado: EstadoReserva;
  estadoPago?: string;
  puedePagar?: boolean;
  puedeCancelar?: boolean;
  pagoSimuladoEnRevision?: boolean;
  comprobanteAprobado?: { generado: boolean; url: string | null };
  adultos: number;
  ninos: number;
  bebes: number;
  precioPorNoche: number;
};
