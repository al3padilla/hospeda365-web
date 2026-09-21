"use client";

import { useMemo } from "react";
import { BedDouble, CalendarClock, FileText, Percent, Wallet } from "lucide-react";

import type { HabitacionAdmin, ReservaAdmin } from "../../servicios/adminService";
import { formatearDinero } from "../../datos/metricas";
import { periodoActual, resumirPanel } from "../../datos/metricasPanel";
import GraficaIngresos from "../../components/GraficaIngresos";
import EstadoHabitaciones from "../../components/EstadoHabitaciones";
import styles from "./admin.module.css";

type DashboardAdminProps = {
  reservations: ReservaAdmin[];
  rooms: HabitacionAdmin[];
};

/** Colores del panel de gestión, para que la gráfica no desentone. */
const COLOR_PANEL = "#176f85";
const COLOR_PANEL_TENUE = "#a8d0da";

/**
 * Dashboard administrativo dentro de /admin.
 *
 * Recibe las mismas reservas y habitaciones que usa el panel de gestión, así
 * que todo lo que se muestra aquí está calculado en vivo: si recepción aprueba
 * un comprobante o cambia el estado de una habitación, el dashboard cambia.
 */
export default function DashboardAdmin({ reservations, rooms }: DashboardAdminProps) {
  const r = useMemo(() => resumirPanel(reservations, rooms), [reservations, rooms]);
  const actual = periodoActual();

  const tarjetas = [
    {
      icono: Percent,
      etiqueta: "Ocupación actual",
      valor: `${r.ocupacionPorcentaje.toFixed(0)}%`,
      detalle: `${r.habitacionesOcupadas} de ${r.habitacionesTotales} habitaciones`,
      medidor: r.ocupacionPorcentaje / 100,
    },
    {
      icono: Wallet,
      etiqueta: "Ingresos confirmados",
      valor: formatearDinero(r.ingresosConfirmados),
      detalle: "Comprobantes aprobados",
    },
    {
      icono: FileText,
      etiqueta: "Por cobrar",
      valor: formatearDinero(r.porCobrar),
      detalle: `${r.comprobantesPorValidar} comprobante${r.comprobantesPorValidar === 1 ? "" : "s"} por validar`,
    },
    {
      icono: CalendarClock,
      etiqueta: "Reservas pendientes",
      valor: String(r.reservasPendientes),
      detalle: "Esperan confirmación",
    },
  ];

  return (
    <>
      {/* Tarjetas con el mismo estilo que las del panel principal */}
      <div className={styles.cards}>
        {tarjetas.map((t) => {
          const Icono = t.icono;
          return (
            <article key={t.etiqueta}>
              <Icono />
              <span>{t.etiqueta}</span>
              <strong>{t.valor}</strong>
              <small className="col-span-2 mt-1 text-xs text-[#71878e]">
                {t.detalle}
              </small>
              {t.medidor !== undefined ? (
                // La pista es un paso claro del mismo tono: el estado se lee
                // a lo largo de toda la barra.
                <div
                  className="col-span-2 mt-2 h-1.5 overflow-hidden rounded-full bg-[#dcebef]"
                  role="img"
                  aria-label={`${Math.round(t.medidor * 100)} por ciento de ocupación`}
                >
                  <div
                    className="h-full rounded-full bg-[#176f85]"
                    style={{ width: `${Math.min(100, Math.max(0, t.medidor * 100))}%` }}
                  />
                </div>
              ) : null}
            </article>
          );
        })}
      </div>

      <section className={styles.panel}>
        <div className={styles.panelHead}>
          <div>
            <h2>Ganancias mensuales</h2>
            <p>
              Ingresos con comprobante aprobado, agrupados por mes de check-in.
              Pasa el cursor sobre una barra para ver el detalle.
            </p>
          </div>
        </div>
        <GraficaIngresos
          datos={r.ingresosPorMes}
          periodoActual={actual}
          mostrarTitulo={false}
          color={COLOR_PANEL}
          colorTenue={COLOR_PANEL_TENUE}
        />
      </section>

      <div className="grid gap-[18px] lg:grid-cols-[1.6fr_1fr]">
        <section className={styles.panel}>
          <div className={styles.panelHead}>
            <div>
              <h2>Estado de las habitaciones</h2>
              <p>
                {r.habitacionesTotales} habitaciones · se actualiza al cambiar el
                estado en Gestión de habitaciones.
              </p>
            </div>
          </div>
          <EstadoHabitaciones
            datos={r.estadoHabitaciones}
            total={r.habitacionesTotales}
            mostrarTitulo={false}
          />
        </section>

        <section className={styles.panel}>
          <div className={styles.panelHead}>
            <div>
              <h2>Reservas por estado</h2>
              <p>Todas las reservas registradas en el panel.</p>
            </div>
          </div>
          <ul className="m-0 list-none space-y-3 p-0">
            {r.reservasPorEstado.map((e) => (
              <li
                key={e.etiqueta}
                className="flex items-center justify-between gap-3 border-b border-[#e6eef0] pb-3 last:border-0 last:pb-0"
              >
                <span className="flex items-center gap-2 text-sm text-[#17323b]">
                  <BedDouble className="h-4 w-4 text-[#71878e]" aria-hidden />
                  {e.etiqueta}
                </span>
                <span
                  className="text-lg font-bold text-[#17323b]"
                  style={{ fontVariantNumeric: "tabular-nums" }}
                >
                  {e.cantidad}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
