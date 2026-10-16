import {
  calcularNoches,
  fechasPorDefecto,
  formatearFecha,
} from "./fechas";

export { calcularNoches, fechasPorDefecto, formatearFecha };

export function calcularTotal(precioPorNoche: number, noches: number): number {
  return precioPorNoche * noches;
}

export function formatearPrecio(valor: number): string {
  return `$${valor.toLocaleString("es-MX")}`;
}

export function urlConfirmacion(opts: {
  habitacionId?: string;
  checkIn?: string;
  checkOut?: string;
}): string {
  const params = new URLSearchParams();
  if (opts.habitacionId) params.set("habitacion", opts.habitacionId);
  if (opts.checkIn) params.set("checkIn", opts.checkIn);
  if (opts.checkOut) params.set("checkOut", opts.checkOut);
  const query = params.toString();
  return query ? `/confirmacion?${query}` : "/confirmacion";
}
