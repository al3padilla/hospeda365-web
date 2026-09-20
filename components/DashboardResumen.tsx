"use client";

import { useEffect, useState } from "react";
import {
  BedDouble,
  CalendarClock,
  FileCheck2,
  Percent,
  Table2,
  Wallet,
} from "lucide-react";

import { useAuth } from "../contexto/AuthContext";
import {
  formatearDinero,
  formatearDineroCompacto,
  variacion,
  type Metricas,
} from "../datos/metricas";
import { servicioMetricas } from "../servicios";
import { PageLoader } from "./Loader";
import TarjetaMetrica from "./TarjetaMetrica";
import GraficaIngresos from "./GraficaIngresos";
import EstadoHabitaciones from "./EstadoHabitaciones";

const ETIQUETA_ESTADO_RESERVA: Record<string, string> = {
  confirmada: "Confirmadas",
  pendiente: "Pendientes",
  cancelada: "Canceladas",
};

export default function DashboardResumen() {
  const { esPersonal, estaAutenticado, state, nombreCompleto } = useAuth();

  const [metricas, setMetricas] = useState<Metricas | null>(null);
  const [cargando, setCargando] = useState(true);
  const [verTabla, setVerTabla] = useState(false);

  useEffect(() => {
    let cancelado = false;

    void (async () => {
      try {
        const datos = await servicioMetricas.obtenerResumen();
        if (!cancelado) setMetricas(datos);
      } finally {
        if (!cancelado) setCargando(false);
      }
    })();

    return () => {
      cancelado = true;
    };
  }, []);

  // Mientras se restaura la sesión guardada no decidimos nada: evita
  // mandar al login a alguien que sí tenía permiso.
  if (state.estado === "inicializando") {
    return <PageLoader titulo="Verificando tu sesión…" />;
  }

  if (!estaAutenticado) {
    return (
      <Aviso
        titulo="Necesitas iniciar sesión"
        texto="Este panel es solo para el personal del hotel."
      />
    );
  }

  if (!esPersonal) {
    return (
      <Aviso
        titulo="No tienes acceso a este panel"
        texto={`${nombreCompleto}, tu cuenta es de huésped. El dashboard administrativo es para recepción y administración.`}
      />
    );
  }

  if (cargando || !metricas) {
    return <PageLoader titulo="Calculando métricas…" subtitulo="Un momento" />;
  }

  const deltaIngresos = variacion(
    metricas.ingresosMes,
    metricas.ingresosMesAnterior,
  );

  return (
    <section className="container mx-auto max-w-6xl px-4 py-10 sm:py-12">
      <header className="mb-7">
        <p className="text-xs uppercase tracking-[0.12em] text-mist">
          Panel administrativo
        </p>
        <h1 className="mt-1 font-[family-name:var(--font-display)] text-3xl text-sea sm:text-4xl">
          Resumen del hotel
        </h1>
        <p className="mt-1.5 text-sm text-mist">
          Septiembre 2026 · datos de demostración
        </p>
      </header>

      {/* Fila de métricas */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <TarjetaMetrica
          etiqueta="Ocupación actual"
          valor={`${metricas.ocupacionPorcentaje.toFixed(1)}%`}
          icono={Percent}
          medidor={metricas.ocupacionPorcentaje / 100}
          detalle={`${metricas.habitacionesOcupadas} de ${metricas.habitacionesTotales} habitaciones`}
        />
        <TarjetaMetrica
          etiqueta="Ganancias del mes"
          valor={formatearDineroCompacto(metricas.ingresosMes)}
          icono={Wallet}
          delta={deltaIngresos}
          deltaPeriodo="agosto"
          detalle={formatearDinero(metricas.ingresosMes)}
        />
        <TarjetaMetrica
          etiqueta="Reservas pendientes"
          valor={String(metricas.reservasPendientes)}
          icono={CalendarClock}
          subirEsBueno={false}
          detalle="Esperan confirmación"
        />
        <TarjetaMetrica
          etiqueta="Comprobantes por validar"
          valor={String(metricas.comprobantesPorValidar)}
          icono={FileCheck2}
          subirEsBueno={false}
          detalle="En la bandeja de recepción"
        />
      </div>

      {/* Ganancias mensuales */}
      <div className="mt-6 rounded-xl border border-sea/10 bg-foam p-5 sm:p-6">
        <GraficaIngresos
          datos={metricas.historico}
          periodoActual={metricas.periodo}
        />

        <div className="mt-5 border-t border-sea/10 pt-4">
          <button
            type="button"
            onClick={() => setVerTabla((v) => !v)}
            aria-expanded={verTabla}
            className="inline-flex items-center gap-2 text-sm font-medium text-sea transition hover:text-coral"
          >
            <Table2 className="h-4 w-4" aria-hidden />
            {verTabla ? "Ocultar tabla de datos" : "Ver tabla de datos"}
          </button>

          {/* La tabla no es un extra: garantiza que los valores se puedan leer
              sin depender de distinguir colores ni de pasar el cursor. */}
          {verTabla ? (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[320px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-sea/10 text-left">
                    <th className="py-2 pr-4 font-medium text-mist">Mes</th>
                    <th className="py-2 pr-4 font-medium text-mist">Ingresos</th>
                    <th className="py-2 font-medium text-mist">Reservas</th>
                  </tr>
                </thead>
                <tbody style={{ fontVariantNumeric: "tabular-nums" }}>
                  {metricas.historico.map((m) => (
                    <tr key={m.periodo} className="border-b border-sea/5">
                      <td className="py-2 pr-4 text-sea">{m.etiqueta}</td>
                      <td className="py-2 pr-4 text-sea">
                        {formatearDinero(m.ingresos)}
                      </td>
                      <td className="py-2 text-mist">{m.reservas}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </div>
      </div>

      {/* Inventario y reservas */}
      <div className="mt-6 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="rounded-xl border border-sea/10 bg-foam p-5 sm:p-6">
          <EstadoHabitaciones
            datos={metricas.estadoHabitaciones}
            total={metricas.habitacionesTotales}
          />
        </div>

        <div className="rounded-xl border border-sea/10 bg-foam p-5 sm:p-6">
          <h3 className="font-[family-name:var(--font-display)] text-xl text-sea">
            Reservas del mes
          </h3>
          <p className="mt-0.5 text-sm text-mist">Por estado.</p>

          <ul className="mt-4 list-none space-y-3 p-0">
            {metricas.reservasPorEstado.map((r) => (
              <li
                key={r.estado}
                className="flex items-center justify-between gap-3 border-b border-sea/5 pb-3 last:border-0 last:pb-0"
              >
                <span className="flex items-center gap-2 text-sm text-sea">
                  <BedDouble className="h-4 w-4 text-mist" aria-hidden />
                  {ETIQUETA_ESTADO_RESERVA[r.estado] ?? r.estado}
                </span>
                <span
                  className="text-lg font-semibold text-sea"
                  style={{ fontVariantNumeric: "tabular-nums" }}
                >
                  {r.cantidad}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <p className="mt-6 text-center text-xs text-mist">
        Las cifras son datos de demostración. Cuando exista Firestore saldrán del
        documento <code className="font-mono">metricas/2026-09</code>, ya
        precalculado, con una sola lectura.
      </p>
    </section>
  );
}

function Aviso({ titulo, texto }: { titulo: string; texto: string }) {
  return (
    <section className="container mx-auto max-w-lg px-4 py-20 text-center">
      <h1 className="font-[family-name:var(--font-display)] text-2xl text-sea">
        {titulo}
      </h1>
      <p className="mt-2 text-mist">{texto}</p>
    </section>
  );
}
