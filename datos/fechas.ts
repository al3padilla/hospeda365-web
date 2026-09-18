/** Utilidades de fechas (formato YYYY-MM-DD). */

export const DIAS_SEMANA = ["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sá"] as const;

export const MESES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
] as const;

const MS_POR_DIA = 1000 * 60 * 60 * 24;

export function toIsoLocal(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function parseIso(value: string): Date | null {
  if (!value) return null;
  const d = new Date(`${value}T12:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/** Formato corto estable (sin locale) para UI: "26 sep 2026". */
export function formatFechaCorta(value: string): string {
  const d = parseIso(value);
  if (!d) return "";
  const day = String(d.getDate()).padStart(2, "0");
  const month = MESES[d.getMonth()].slice(0, 3).toLowerCase();
  return `${day} ${month} ${d.getFullYear()}`;
}

export function formatearFecha(fecha: string): string {
  if (!fecha) return "—";
  return formatFechaCorta(fecha) || "—";
}

export function calcularNoches(checkIn: string, checkOut: string): number {
  if (!checkIn || !checkOut) return 1;
  const inicio = parseIso(checkIn);
  const fin = parseIso(checkOut);
  if (!inicio || !fin) return 1;
  const diff = Math.round((fin.getTime() - inicio.getTime()) / MS_POR_DIA);
  return Math.max(1, diff);
}

export function fechasPorDefecto(): { checkIn: string; checkOut: string } {
  const hoy = new Date();
  const salida = new Date(hoy);
  salida.setDate(hoy.getDate() + 2);
  return { checkIn: toIsoLocal(hoy), checkOut: toIsoLocal(salida) };
}
