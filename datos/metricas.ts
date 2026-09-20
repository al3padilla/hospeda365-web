/**
 * Métricas del dashboard administrativo.
 *
 * Datos temporales (mock). Cuando exista Firestore, estos números saldrán de
 * la colección `metricas`, que guarda un documento precalculado por mes —
 * así el dashboard hace UNA lectura en vez de recorrer cientos de reservas.
 * Ver docs/firebase-firestore.md.
 */

import type { EstadoReserva } from "./historialReservas";

/** Estados operativos de una habitación física. */
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
  /** Periodo al que corresponde el resumen. */
  periodo: string;
  ocupacionPorcentaje: number;
  habitacionesTotales: number;
  habitacionesOcupadas: number;
  ingresosMes: number;
  ingresosMesAnterior: number;
  reservasPendientes: number;
  comprobantesPorValidar: number;
  /** Serie histórica para la gráfica de ganancias. */
  historico: ResumenMes[];
  /** Distribución actual del inventario físico. */
  estadoHabitaciones: ConteoEstado[];
  /** Cuántas reservas hay en cada estado. */
  reservasPorEstado: { estado: EstadoReserva; cantidad: number }[];
};

/**
 * Paleta de las gráficas.
 *
 * NO se eligió a ojo: se validó con la fórmula de color (banda de luminosidad,
 * piso de croma, separación bajo daltonismo y contraste contra la superficie).
 * El par crítico es verde ↔ naranja, que bajo protanopía es el que más colapsa;
 * este orden lo deja en ΔE 9.1, por encima del umbral de 8.
 *
 * Si cambias un color, revalida antes de subirlo.
 */
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

/** Orden fijo de presentación: nunca se cicla ni se reordena por valor. */
export const ORDEN_ESTADOS: EstadoHabitacion[] = [
  "ocupada",
  "limpieza",
  "disponible",
  "mantenimiento",
];

/**
 * Inventario simulado: 24 habitaciones repartidas entre las seis categorías.
 * Las cifras de ingresos son coherentes con los precios de
 * datos/habitaciones.ts ($89 a $399 por noche).
 */
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

/** Formatea un monto en dólares, sin decimales. */
export function formatearDinero(valor: number): string {
  return `$${valor.toLocaleString("en-US")}`;
}

/**
 * Versión compacta para cifras grandes de las tarjetas: 38420 → $38.4K.
 * Las tarjetas necesitan que el número quepa; la tabla lleva el valor exacto.
 */
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
