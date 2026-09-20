/**
 * CONTRATO del servicio de métricas.
 *
 * Mismo patrón que `ServicioAuth`: el dashboard no sabe de dónde salen los
 * números. Hoy los da un mock; mañana los dará Firestore leyendo el documento
 * precalculado `metricas/{periodo}`.
 */

import type { Metricas } from "../datos/metricas";

export type ServicioMetricas = {
  /**
   * Resumen de un periodo. Sin argumento, el mes en curso.
   * @param periodo formato "2026-09"
   */
  obtenerResumen(periodo?: string): Promise<Metricas>;
};
