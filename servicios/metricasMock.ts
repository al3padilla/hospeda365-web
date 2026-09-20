/**
 * Implementación MOCK del servicio de métricas.
 *
 * Simula la latencia de red con los mismos DELAYS del resto del sitio, para
 * que el dashboard muestre sus estados de carga como lo haría de verdad.
 */

import { METRICAS_MOCK, type Metricas } from "../datos/metricas";
import { DELAYS } from "../datos/carga";
import type { ServicioMetricas } from "./tiposMetricas";

function esperar(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const metricasMock: ServicioMetricas = {
  async obtenerResumen(periodo?: string): Promise<Metricas> {
    await esperar(DELAYS.busqueda);

    // El mock solo conoce un periodo. Cuando esto sea Firestore, la consulta
    // será getDoc(doc(db, "metricas", periodo)) y devolverá el mes pedido.
    if (periodo && periodo !== METRICAS_MOCK.periodo) {
      return { ...METRICAS_MOCK, periodo };
    }

    return METRICAS_MOCK;
  },
};
