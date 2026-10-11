import { METRICAS_MOCK, type Metricas } from "../datos/metricas";
import { DELAYS } from "../datos/carga";
import type { ServicioMetricas } from "./tiposMetricas";

function esperar(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const metricasMock: ServicioMetricas = {
  async obtenerResumen(periodo?: string): Promise<Metricas> {
    await esperar(DELAYS.busqueda);

    // El mock solo tiene un periodo; para otros devuelve los mismos datos.
    if (periodo && periodo !== METRICAS_MOCK.periodo) {
      return { ...METRICAS_MOCK, periodo };
    }

    return METRICAS_MOCK;
  },
};
