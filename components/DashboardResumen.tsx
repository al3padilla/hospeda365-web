"use client";

import { useMemo, useState } from "react";
import {
  BedDouble,
  CalendarClock,
  FileCheck2,
  Percent,
  Table2,
  Wallet,
} from "lucide-react";

import { useAdmin } from "../contexto/AdminContext";
import { useAuth } from "../contexto/AuthContext";
import {
  formatearDinero,
  formatearDineroCompacto,
  variacion,
} from "../datos/metricas";
import { periodoActual, resumirPanel } from "../datos/metricasPanel";
import EstadoHabitaciones from "./EstadoHabitaciones";
import GraficaIngresos from "./GraficaIngresos";
import { PageLoader } from "./Loader";
import TarjetaMetrica from "./TarjetaMetrica";

export default function DashboardResumen() {
  const { esPersonal, estaAutenticado, state, nombreCompleto } = useAuth();
  const { reservations, rooms, loading, error } = useAdmin();
  const [verTabla, setVerTabla] = useState(false);
  const metricas = useMemo(
    () => resumirPanel(reservations, rooms),
    [reservations, rooms],
  );
  const periodo = periodoActual();
  const indiceActual = metricas.ingresosPorMes.findIndex(
    (item) => item.periodo === periodo,
  );
  const ingresosMes =
    indiceActual >= 0 ? metricas.ingresosPorMes[indiceActual].ingresos : 0;
  const ingresosMesAnterior =
    indiceActual > 0 ? metricas.ingresosPorMes[indiceActual - 1].ingresos : 0;

  if (state.estado === "inicializando") {
    return <PageLoader titulo="Verificando sesión…" />;
  }

  if (!estaAutenticado) {
    return <Aviso titulo="Inicio de sesión requerido" texto="Panel restringido al personal." />;
  }

  if (!esPersonal) {
    return (
      <Aviso
        titulo="Acceso denegado"
        texto={`${nombreCompleto}, esta cuenta no tiene permisos administrativos.`}
      />
    );
  }

  if (loading) return <PageLoader titulo="Sincronizando métricas…" />;

  if (error) return <Aviso titulo="Error de sincronización" texto={error} />;

  return (
    <section className="container mx-auto max-w-6xl px-4 py-10 sm:py-12">
      <header className="mb-7">
        <p className="text-xs uppercase tracking-[0.12em] text-mist">
          Panel administrativo
        </p>
        <h1 className="mt-1 font-[family-name:var(--font-display)] text-3xl text-sea sm:text-4xl">
          Resumen del hotel
        </h1>
        <p className="mt-1.5 text-sm text-mist">Periodo {periodo}</p>
      </header>

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
          valor={formatearDineroCompacto(ingresosMes)}
          icono={Wallet}
          delta={variacion(ingresosMes, ingresosMesAnterior)}
          detalle={formatearDinero(ingresosMes)}
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
          detalle="En revisión"
        />
      </div>

      <div className="mt-6 rounded-xl border border-sea/10 bg-foam p-5 sm:p-6">
        <GraficaIngresos datos={metricas.ingresosPorMes} periodoActual={periodo} />
        <div className="mt-5 border-t border-sea/10 pt-4">
          <button
            type="button"
            onClick={() => setVerTabla((value) => !value)}
            aria-expanded={verTabla}
            className="inline-flex items-center gap-2 text-sm font-medium text-sea"
          >
            <Table2 className="h-4 w-4" aria-hidden />
            {verTabla ? "Ocultar tabla" : "Ver tabla"}
          </button>

          {verTabla ? (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[320px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-sea/10 text-left">
                    <th className="py-2 pr-4">Mes</th>
                    <th className="py-2 pr-4">Ingresos</th>
                    <th className="py-2">Reservas</th>
                  </tr>
                </thead>
                <tbody>
                  {metricas.ingresosPorMes.map((item) => (
                    <tr key={item.periodo} className="border-b border-sea/5">
                      <td className="py-2 pr-4">{item.etiqueta}</td>
                      <td className="py-2 pr-4">{formatearDinero(item.ingresos)}</td>
                      <td className="py-2">{item.reservas}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="rounded-xl border border-sea/10 bg-foam p-5 sm:p-6">
          <EstadoHabitaciones
            datos={metricas.estadoHabitaciones}
            total={metricas.habitacionesTotales}
          />
        </div>
        <div className="rounded-xl border border-sea/10 bg-foam p-5 sm:p-6">
          <h3 className="font-[family-name:var(--font-display)] text-xl text-sea">
            Reservas por estado
          </h3>
          <ul className="mt-4 space-y-3">
            {metricas.reservasPorEstado.map((item) => (
              <li
                key={item.etiqueta}
                className="flex items-center justify-between border-b border-sea/5 pb-3"
              >
                <span className="flex items-center gap-2 text-sm text-sea">
                  <BedDouble className="h-4 w-4 text-mist" aria-hidden />
                  {item.etiqueta}
                </span>
                <strong>{item.cantidad}</strong>
              </li>
            ))}
          </ul>
        </div>
      </div>
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
