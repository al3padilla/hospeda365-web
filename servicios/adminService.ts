export {
  actualizarHabitacion,
  actualizarReserva,
  cambiarActividadHabitacion,
  cambiarEstadoHabitacion,
  cambiarEstadoPago,
  cancelarReserva,
  crearHabitacion,
  crearReserva,
  escucharHabitacionesAdmin,
  escucharReservasAdmin,
} from "./hotelFirestore";

export type {
  DatosHabitacion,
  EstadoHabitacion,
  EstadoPago,
  HabitacionAdmin,
  NuevaReserva,
  ReservaAdmin,
} from "./tiposHotel";
