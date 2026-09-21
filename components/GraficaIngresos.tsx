"use client";

import { useState } from "react";
import { formatearDinero, type ResumenMes } from "../datos/metricas";

type GraficaIngresosProps = {
  datos: ResumenMes[];
  /** Periodo en curso: se resalta y siempre lleva etiqueta. */
  periodoActual: string;
  /** Oculta título y subtítulo cuando el contenedor ya trae los suyos. */
  mostrarTitulo?: boolean;
  /** Color de la barra resaltada y de las demás. */
  color?: string;
  colorTenue?: string;
};

// Geometría del dibujo. El viewBox deja aire arriba para las etiquetas de
// valor y a la izquierda para el eje, para que nada quede recortado.
const ANCHO = 720;
const ALTO = 250;
const M = { arriba: 26, derecha: 14, abajo: 30, izquierda: 56 };
const ANCHO_PLOT = ANCHO - M.izquierda - M.derecha;
const ALTO_PLOT = ALTO - M.arriba - M.abajo;

/** Una sola serie, un solo tono. Sin leyenda: el título dice qué se grafica. */
const COLOR_BARRA = "#2a6fb0";
const COLOR_BARRA_TENUE = "#9dc0e0";

/** Tope del eje cuando no hay ningún ingreso: evita dividir entre cero. */
const TOPE_MINIMO = 100;

/** Redondea el tope a un número limpio para que las marcas del eje lo sean. */
function topeEje(max: number): number {
  if (max <= 0) return TOPE_MINIMO;
  const magnitud = Math.pow(10, Math.floor(Math.log10(max)));
  return Math.ceil(max / (magnitud / 2)) * (magnitud / 2);
}

export default function GraficaIngresos({
  datos,
  periodoActual,
  mostrarTitulo = true,
  color = COLOR_BARRA,
  colorTenue = COLOR_BARRA_TENUE,
}: GraficaIngresosProps) {
  const [activo, setActivo] = useState<number | null>(null);

  const maximo = Math.max(...datos.map((d) => d.ingresos));
  const tope = topeEje(maximo);
  const marcas = [0, tope / 3, (tope * 2) / 3, tope];

  const banda = ANCHO_PLOT / datos.length;
  const anchoBarra = Math.min(24, banda * 0.45);

  const y = (valor: number) => M.arriba + ALTO_PLOT - (valor / tope) * ALTO_PLOT;
  const xBanda = (i: number) => M.izquierda + banda * i;
  const xCentro = (i: number) => xBanda(i) + banda / 2;

  const indiceMax = maximo > 0 ? datos.findIndex((d) => d.ingresos === maximo) : -1;
  const indiceActual = datos.findIndex((d) => d.periodo === periodoActual);

  return (
    <figure className="m-0">
      {mostrarTitulo ? (
        <figcaption className="mb-1">
          <h3 className="font-[family-name:var(--font-display)] text-xl text-sea">
            Ganancias mensuales
          </h3>
          <p className="mt-0.5 text-sm text-mist">
            Ingresos confirmados por mes, en dólares. Pasa el cursor para ver el
            detalle.
          </p>
        </figcaption>
      ) : null}

      <div className="relative mt-4">
        <svg
          viewBox={`0 0 ${ANCHO} ${ALTO}`}
          className="w-full"
          role="img"
          aria-label={`Gráfica de barras de ingresos mensuales, de ${datos[0].etiqueta} a ${datos[datos.length - 1].etiqueta}. Máximo ${formatearDinero(maximo)}.`}
          onMouseLeave={() => setActivo(null)}
        >
          {/* Cuadrícula: línea fina continua, un paso fuera de la superficie */}
          {marcas.map((m) => (
            <g key={m}>
              <line
                x1={M.izquierda}
                y1={y(m)}
                x2={ANCHO - M.derecha}
                y2={y(m)}
                stroke="#dbe5ee"
                strokeWidth="1"
              />
              <text
                x={M.izquierda - 10}
                y={y(m) + 4}
                textAnchor="end"
                fill="#5a7a9a"
                fontSize="11"
                style={{ fontVariantNumeric: "tabular-nums" }}
              >
                {m === 0 ? "0" : `${Math.round(m / 1000)}K`}
              </text>
            </g>
          ))}

          {datos.map((d, i) => {
            const alto = ALTO_PLOT - (y(d.ingresos) - M.arriba);
            const esActual = i === indiceActual;
            const resaltado = activo === i || esActual;
            // Etiqueta solo en el máximo y en el mes en curso: un número sobre
            // cada barra se vuelve ruido y nadie lo lee.
            const llevaEtiqueta = i === indiceMax || esActual;

            return (
              <g key={d.periodo}>
                {/* Zona de detección más ancha que la barra, para que el
                    cursor la encuentre sin puntería fina. */}
                <rect
                  x={xBanda(i)}
                  y={M.arriba}
                  width={banda}
                  height={ALTO_PLOT}
                  fill="transparent"
                  onMouseEnter={() => setActivo(i)}
                />

                <rect
                  x={xCentro(i) - anchoBarra / 2}
                  y={y(d.ingresos)}
                  width={anchoBarra}
                  height={Math.max(2, alto)}
                  rx="4"
                  fill={resaltado ? color : colorTenue}
                  pointerEvents="none"
                />
                {/* Tapa el redondeo inferior: la barra nace cuadrada de la base */}
                <rect
                  x={xCentro(i) - anchoBarra / 2}
                  y={y(d.ingresos) + Math.max(2, alto) - 4}
                  width={anchoBarra}
                  height="4"
                  fill={resaltado ? color : colorTenue}
                  pointerEvents="none"
                />

                {llevaEtiqueta ? (
                  <text
                    x={xCentro(i)}
                    y={y(d.ingresos) - 8}
                    textAnchor="middle"
                    fill="#0c2438"
                    fontSize="11"
                    fontWeight="600"
                    pointerEvents="none"
                  >
                    {formatearDinero(d.ingresos)}
                  </text>
                ) : null}

                <text
                  x={xCentro(i)}
                  y={ALTO - 10}
                  textAnchor="middle"
                  fill={esActual ? "#0c2438" : "#5a7a9a"}
                  fontSize="11"
                  fontWeight={esActual ? "600" : "400"}
                  pointerEvents="none"
                >
                  {d.etiqueta}
                </text>
              </g>
            );
          })}

          {/* Línea base */}
          <line
            x1={M.izquierda}
            y1={y(0)}
            x2={ANCHO - M.derecha}
            y2={y(0)}
            stroke="#b9cbdb"
            strokeWidth="1"
          />
        </svg>

        {activo !== null ? (
          <div
            className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-md border border-sea/15 bg-foam px-3 py-2 shadow-lg"
            style={{
              left: `${(xCentro(activo) / ANCHO) * 100}%`,
              top: `${(y(datos[activo].ingresos) / ALTO) * 100}%`,
            }}
          >
            <p className="text-xs text-mist">{datos[activo].etiqueta} {datos[activo].periodo.slice(0, 4)}</p>
            <p className="text-sm font-semibold text-sea">
              {formatearDinero(datos[activo].ingresos)}
            </p>
            <p className="text-xs text-mist">{datos[activo].reservas} {datos[activo].reservas === 1 ? "reserva" : "reservas"}</p>
          </div>
        ) : null}
      </div>
    </figure>
  );
}
