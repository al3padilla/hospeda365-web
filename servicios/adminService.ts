export {
  actualizarReserva,
  cambiarEstadoHabitacion,
  cambiarEstadoPago,
  cancelarReserva,
  crearReserva,
  escucharHabitacionesAdmin,
  escucharReservasAdmin,
} from "./hotelFirestore";

export type {
  EstadoHabitacion,
  EstadoPago,
  HabitacionAdmin,
  NuevaReserva,
  ReservaAdmin,
} from "./tiposHotel";
