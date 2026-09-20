import type { LucideIcon } from "lucide-react";
import { TrendingDown, TrendingUp } from "lucide-react";

type TarjetaMetricaProps = {
  /** Sentencia corta, sin dos puntos al final. */
  etiqueta: string;
  /** Valor ya formateado. */
  valor: string;
  icono: LucideIcon;
  /** Variación porcentual contra el periodo anterior. */
  delta?: number;
  /** Cómo se llama ese periodo, para que el delta signifique algo. */
  deltaPeriodo?: string;
  /** Si subir es bueno. Para reservas pendientes, por ejemplo, no lo es. */
  subirEsBueno?: boolean;
  /** Fracción 0–1. Dibuja un medidor bajo el valor. */
  medidor?: number;
  /** Texto auxiliar bajo el valor. */
  detalle?: string;
};

/**
 * Tarjeta de métrica (stat tile).
 *
 * El valor usa cifras proporcionales a propósito: `tabular-nums` da a cada
 * dígito el ancho de un cero, y a tamaño grande un número como "16" se ve
 * suelto. Las cifras tabulares se reservan para columnas que deben alinearse.
 */
export default function TarjetaMetrica({
  etiqueta,
  valor,
  icono: Icono,
  delta,
  deltaPeriodo,
  subirEsBueno = true,
  medidor,
  detalle,
}: TarjetaMetricaProps) {
  const subio = delta !== undefined && delta > 0;
  const hayDelta = delta !== undefined && Math.abs(delta) >= 0.05;
  // El color dice si la noticia es buena, no si el número subió.
  const deltaBueno = subio === subirEsBueno;

  return (
    <article className="rounded-xl border border-sea/10 bg-foam p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm text-mist">{etiqueta}</p>
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-sea/5 text-sea">
          <Icono className="h-4 w-4" aria-hidden />
        </span>
      </div>

      <p className="mt-3 text-3xl font-semibold leading-none text-sea">{valor}</p>

      {medidor !== undefined ? (
        <div className="mt-3.5">
          {/* La pista es un paso más claro del mismo tono, no un gris neutro:
              así el estado se lee a lo largo de toda la barra. */}
          <div
            className="h-1.5 w-full overflow-hidden rounded-full bg-sea/15"
            role="img"
            aria-label={`${Math.round(medidor * 100)} por ciento`}
          >
            <div
              className="h-full rounded-full bg-sea"
              style={{ width: `${Math.min(100, Math.max(0, medidor * 100))}%` }}
            />
          </div>
        </div>
      ) : null}

      {hayDelta ? (
        <p
          className={`mt-3 flex items-center gap-1.5 text-sm ${
            deltaBueno ? "text-emerald-700" : "text-red-700"
          }`}
        >
          {subio ? (
            <TrendingUp className="h-3.5 w-3.5" aria-hidden />
          ) : (
            <TrendingDown className="h-3.5 w-3.5" aria-hidden />
          )}
          <span className="font-medium">
            {subio ? "+" : ""}
            {delta.toFixed(1)}%
          </span>
          {deltaPeriodo ? (
            <span className="text-mist">vs. {deltaPeriodo}</span>
          ) : null}
        </p>
      ) : null}

      {detalle ? <p className="mt-3 text-sm text-mist">{detalle}</p> : null}
    </article>
  );
}
