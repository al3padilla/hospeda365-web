export type EstadoHabitacion =
  | "disponible"
  | "ocupada"
  | "limpieza"
  | "mantenimiento";

export type ResumenMes = {
  /** "2026-09" */
  periodo: string;
  /** Etiqueta corta para el eje: "Sep". */
  etiqueta: string;
  ingresos: number;
  reservas: number;
};

export type ConteoEstado = {
  estado: EstadoHabitacion;
  cantidad: number;
};

// Paleta validada para daltonismo (verde ↔ naranja ΔE 9.1); revalidar si se cambia.
export const COLOR_ESTADO: Record<EstadoHabitacion, string> = {
  ocupada: "#2a6fb0",
  limpieza: "#d97706",
  disponible: "#0f8a6a",
  mantenimiento: "#9333a8",
};

export const ETIQUETA_ESTADO: Record<EstadoHabitacion, string> = {
  ocupada: "Ocupada",
  limpieza: "Limpieza",
  disponible: "Disponible",
  mantenimiento: "Mantenimiento",
};

/** Orden fijo: no se reordena por valor. */
export const ORDEN_ESTADOS: EstadoHabitacion[] = [
  "ocupada",
  "limpieza",
  "disponible",
  "mantenimiento",
];

export function formatearDinero(valor: number): string {
  return `$${valor.toLocaleString("en-US")}`;
}

/** 38420 → $38.4K */
export function formatearDineroCompacto(valor: number): string {
  if (Math.abs(valor) >= 1000) {
    return `$${(valor / 1000).toFixed(1)}K`;
  }
  return `$${valor}`;
}

/** Variación porcentual entre dos periodos. */
export function variacion(actual: number, anterior: number): number {
  if (anterior === 0) return 0;
  return ((actual - anterior) / anterior) * 100;
}
