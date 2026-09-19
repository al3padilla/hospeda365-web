/** Delays simulados (demo / rúbrica) para estados de carga visibles. */
export const DELAYS = {
  ruta: 900,
  busqueda: 1200,
  subida: 1100,
  confirmar: 1400,
} as const;

/** Simula latencia de red en Server Components (muestra PageLoader vía Suspense). */
export function esperar(ms: number = DELAYS.ruta): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
