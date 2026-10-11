import type { EstadoReserva } from "./historialReservas";

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

export type Metricas = {
  periodo: string;
  ocupacionPorcentaje: number;
  habitacionesTotales: number;
  habitacionesOcupadas: number;
  ingresosMes: number;
  ingresosMesAnterior: number;
  reservasPendientes: number;
  comprobantesPorValidar: number;
  historico: ResumenMes[];
  estadoHabitaciones: ConteoEstado[];
  reservasPorEstado: { estado: EstadoReserva; cantidad: number }[];
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

export const METRICAS_MOCK: Metricas = {
  periodo: "2026-09",
  ocupacionPorcentaje: 66.7,
  habitacionesTotales: 24,
  habitacionesOcupadas: 16,
  ingresosMes: 38420,
  ingresosMesAnterior: 34150,
  reservasPendientes: 7,
  comprobantesPorValidar: 3,

  historico: [
    { periodo: "2026-02", etiqueta: "Feb", ingresos: 21300, reservas: 42 },
    { periodo: "2026-03", etiqueta: "Mar", ingresos: 26800, reservas: 51 },
    { periodo: "2026-04", etiqueta: "Abr", ingresos: 31450, reservas: 58 },
    { periodo: "2026-05", etiqueta: "May", ingresos: 28900, reservas: 54 },
    { periodo: "2026-06", etiqueta: "Jun", ingresos: 35600, reservas: 66 },
    { periodo: "2026-07", etiqueta: "Jul", ingresos: 42100, reservas: 78 },
    { periodo: "2026-08", etiqueta: "Ago", ingresos: 34150, reservas: 63 },
    { periodo: "2026-09", etiqueta: "Sep", ingresos: 38420, reservas: 71 },
  ],

  estadoHabitaciones: [
    { estado: "ocupada", cantidad: 16 },
    { estado: "limpieza", cantidad: 4 },
    { estado: "disponible", cantidad: 3 },
    { estado: "mantenimiento", cantidad: 1 },
  ],

  reservasPorEstado: [
    { estado: "confirmada", cantidad: 18 },
    { estado: "pendiente", cantidad: 7 },
    { estado: "cancelada", cantidad: 2 },
  ],
};

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
