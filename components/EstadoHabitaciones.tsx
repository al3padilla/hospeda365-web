"use client";

import { useState } from "react";
import {
  COLOR_ESTADO,
  ETIQUETA_ESTADO,
  ORDEN_ESTADOS,
  type ConteoEstado,
} from "../datos/metricas";

type EstadoHabitacionesProps = {
  datos: ConteoEstado[];
  total: number;
  mostrarTitulo?: boolean;
};

/** Porcentaje mínimo para que la etiqueta quepa dentro del segmento. */
const MINIMO_PARA_ETIQUETA = 12;

export default function EstadoHabitaciones({
  datos,
  total,
  mostrarTitulo = true,
}: EstadoHabitacionesProps) {
  const [activo, setActivo] = useState<string | null>(null);

  const segmentos = ORDEN_ESTADOS.map((estado) => {
    const encontrado = datos.find((d) => d.estado === estado);
    return { estado, cantidad: encontrado?.cantidad ?? 0 };
  }).filter((s) => s.cantidad > 0);

  return (
    <figure className="m-0">
      {mostrarTitulo ? (
        <figcaption className="mb-1">
          <h3 className="font-[family-name:var(--font-display)] text-xl text-sea">
            Estado de las habitaciones
          </h3>
          <p className="mt-0.5 text-sm text-mist">
            {total} habitaciones en inventario, ahora mismo.
          </p>
        </figcaption>
      ) : null}

      <div
        className="mt-4 flex h-11 w-full gap-[2px] overflow-hidden rounded-md"
        role="img"
        aria-label={segmentos
          .map((s) => `${ETIQUETA_ESTADO[s.estado]}: ${s.cantidad}`)
          .join(". ")}
      >
        {segmentos.map((s) => {
          const porcentaje = (s.cantidad / total) * 100;
          const cabe = porcentaje >= MINIMO_PARA_ETIQUETA;

          return (
            <div
              key={s.estado}
              className="flex items-center justify-center transition-opacity"
              style={{
                width: `${porcentaje}%`,
                backgroundColor: COLOR_ESTADO[s.estado],
                opacity: activo && activo !== s.estado ? 0.45 : 1,
              }}
              onMouseEnter={() => setActivo(s.estado)}
              onMouseLeave={() => setActivo(null)}
              title={`${ETIQUETA_ESTADO[s.estado]}: ${s.cantidad} de ${total}`}
            >
              {cabe ? (
                <span className="text-sm font-semibold text-white">
                  {s.cantidad}
                </span>
              ) : null}
            </div>
          );
        })}
      </div>

      <ul className="mt-4 grid list-none grid-cols-2 gap-x-4 gap-y-2.5 p-0 sm:grid-cols-4">
        {segmentos.map((s) => (
          <li
            key={s.estado}
            className="flex items-center gap-2"
            onMouseEnter={() => setActivo(s.estado)}
            onMouseLeave={() => setActivo(null)}
          >
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-sm"
              style={{ backgroundColor: COLOR_ESTADO[s.estado] }}
              aria-hidden
            />
            <span className="min-w-0">
              <span className="block truncate text-sm text-sea">
                {ETIQUETA_ESTADO[s.estado]}
              </span>
              <span
                className="block text-xs text-mist"
                style={{ fontVariantNumeric: "tabular-nums" }}
              >
                {s.cantidad} · {((s.cantidad / total) * 100).toFixed(0)}%
              </span>
            </span>
          </li>
        ))}
      </ul>
    </figure>
  );
}
