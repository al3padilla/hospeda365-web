/**
 * "1 noche" / "2 noches". Para plurales irregulares pasa la forma plural
 * explícita: pluralizar(n, "habitación", "habitaciones").
 */
export function pluralizar(cantidad: number, singular: string, plural = `${singular}s`): string {
  return `${cantidad} ${cantidad === 1 ? singular : plural}`;
}
