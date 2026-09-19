"use client";

import { useCallback, useState } from "react";
import {
  CalendarRange,
  CheckCircle2,
  Clock3,
  Eye,
  History,
  XCircle,
} from "lucide-react";
import {
  RESERVAS_HISTORIAL,
  type EstadoReserva,
  type ReservaHistorial,
} from "../datos/historialReservas";
import { formatearFecha } from "../datos/fechas";
import { formatearPrecio } from "../datos/reserva";
import { useBloqueoModal } from "../hooks/useBloqueoModal";
import ReservaHistorialModal from "./ReservaHistorialModal";

const ESTADO_UI: Record<
  EstadoReserva,
  {
    label: string;
    className: string;
    Icon: typeof CheckCircle2;
  }
> = {
  confirmada: {
    label: "Confirmada",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Icon: CheckCircle2,
  },
  pendiente: {
    label: "Pendiente",
    className: "bg-amber-50 text-amber-700 border-amber-200",
    Icon: Clock3,
  },
  cancelada: {
    label: "Cancelada",
    className: "bg-red-50 text-red-700 border-red-200",
    Icon: XCircle,
  },
};

function BadgeEstado({ estado }: { estado: EstadoReserva }) {
  const { label, className, Icon } = ESTADO_UI[estado];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-semibold tracking-wide ${className}`}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden />
      {label}
    </span>
  );
}

function ReservaCard({
  reserva,
  onAbrir,
}: {
  reserva: ReservaHistorial;
  onAbrir: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onAbrir}
      className="group flex w-full flex-col gap-4 overflow-hidden rounded-xl border border-sea/10 bg-foam text-left transition hover:border-sea/25 sm:flex-row"
      aria-label={`Ver detalle de reserva Habitación ${reserva.habitacionNombre}`}
    >
      <div
        className="h-36 shrink-0 bg-cover bg-center bg-sea/15 sm:h-auto sm:w-40"
        style={{ backgroundImage: `url(${reserva.imagenUrl})` }}
        role="img"
        aria-hidden
      />

      <div className="flex flex-1 flex-col gap-3 p-4 sm:py-5 sm:pr-5">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <h3 className="font-[family-name:var(--font-display)] text-xl text-sea">
            Habitación {reserva.habitacionNombre}
          </h3>
          <BadgeEstado estado={reserva.estado} />
        </div>

        <p className="flex items-center gap-2 text-sm text-mist">
          <CalendarRange className="h-4 w-4 shrink-0 text-coral" aria-hidden />
          <span>
            {formatearFecha(reserva.checkIn)} —{" "}
            {formatearFecha(reserva.checkOut)}
          </span>
        </p>

        <div className="mt-auto flex items-end justify-between gap-3 pt-1">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-sea opacity-0 transition group-hover:opacity-100">
            <Eye className="h-3.5 w-3.5 text-coral" aria-hidden />
            Ver detalle
          </span>
          <div className="flex items-end gap-3">
            <span className="text-xs uppercase tracking-wider text-mist">
              Total
            </span>
            <span className="text-lg font-semibold text-sea">
              {formatearPrecio(reserva.total)}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}

export default function HistorialReservas() {
  const reservas = RESERVAS_HISTORIAL;
  const [seleccionada, setSeleccionada] = useState<ReservaHistorial | null>(
    null,
  );

  const cerrar = useCallback(() => setSeleccionada(null), []);
  useBloqueoModal(seleccionada !== null, cerrar);

  return (
    <div className="container mx-auto max-w-5xl px-4 py-10 sm:py-14">
      <header className="mb-8 max-w-2xl sm:mb-10">
        <p className="mb-1 font-[family-name:var(--font-script)] text-3xl text-mist">
          Tus viajes
        </p>
        <h1 className="mb-3 flex items-center gap-3 font-[family-name:var(--font-display)] text-4xl text-sea sm:text-5xl">
          <History className="h-9 w-9 shrink-0 text-coral" aria-hidden />
          Historial de reservas
        </h1>
        <p className="leading-relaxed text-mist">
          Consulta tus estancias pasadas y próximas. Los estados se actualizan
          cuando el hotel confirma o cancela tu solicitud.
        </p>
      </header>

      {reservas.length === 0 ? (
        <p className="rounded-xl border border-dashed border-sea/20 bg-foam py-16 text-center text-mist">
          Aún no tienes reservas registradas.
        </p>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {reservas.map((reserva) => (
            <ReservaCard
              key={reserva.id}
              reserva={reserva}
              onAbrir={() => setSeleccionada(reserva)}
            />
          ))}
        </div>
      )}

      {seleccionada ? (
        <ReservaHistorialModal
          reserva={seleccionada}
          badge={ESTADO_UI[seleccionada.estado]}
          onClose={cerrar}
        />
      ) : null}
    </div>
  );
}
