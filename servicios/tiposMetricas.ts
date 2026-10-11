import type { Metricas } from "../datos/metricas";

export type ServicioMetricas = {
  /**
   * Sin argumento, devuelve el mes en curso.
   * @param periodo formato "2026-09"
   */
  obtenerResumen(periodo?: string): Promise<Metricas>;
};
