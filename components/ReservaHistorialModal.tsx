"use client";

import {
  BedDouble,
  CalendarCheck,
  CalendarX2,
  Moon,
  Users,
  X,
} from "lucide-react";
import type { ReservaHistorial } from "../datos/historialReservas";
import { calcularNoches, formatearFecha } from "../datos/fechas";
import { formatearPrecio } from "../datos/reserva";

type BadgeEstadoProps = {
  label: string;
  className: string;
  Icon: typeof X;
};

type ReservaHistorialModalProps = {
  reserva: ReservaHistorial;
  badge: BadgeEstadoProps;
  onClose: () => void;
};

function textoHuespedes(reserva: ReservaHistorial): string {
  const partes = [
    `${reserva.adultos} adulto${reserva.adultos === 1 ? "" : "s"}`,
  ];
  if (reserva.ninos > 0) {
    partes.push(
      `${reserva.ninos} niño${reserva.ninos === 1 ? "" : "s"}`,
    );
  }
  if (reserva.bebes > 0) {
    partes.push(
      `${reserva.bebes} bebé${reserva.bebes === 1 ? "" : "s"}`,
    );
  }
  return partes.join(", ");
}

export default function ReservaHistorialModal({
  reserva,
  badge,
  onClose,
}: ReservaHistorialModalProps) {
  const noches = calcularNoches(reserva.checkIn, reserva.checkOut);
  const { label, className, Icon } = badge;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center p-0 sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby={`reserva-modal-${reserva.id}`}
    >
      <button
        type="button"
        className="absolute inset-0 bg-sea-deep/55"
        aria-label="Cerrar"
        onClick={onClose}
      />

      <div className="relative z-10 max-h-[92vh] w-full overflow-y-auto rounded-t-2xl border border-sea/10 bg-foam sm:max-w-lg sm:rounded-2xl">
        <div className="relative h-48 bg-sea/15 sm:h-56">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={reserva.imagenUrl}
            alt={reserva.habitacionNombre}
            className="h-full w-full object-cover"
          />
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 z-10 rounded-md bg-white/95 p-2 text-sea transition hover:bg-white"
            aria-label="Cerrar modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5 p-5 sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="mb-0.5 font-[family-name:var(--font-script)] text-2xl text-mist">
                Detalle de reserva
              </p>
              <h2
                id={`reserva-modal-${reserva.id}`}
                className="font-[family-name:var(--font-display)] text-3xl text-sea"
              >
                Habitación {reserva.habitacionNombre}
              </h2>
            </div>
            <span
              className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-semibold tracking-wide ${className}`}
            >
              <Icon className="h-3.5 w-3.5" aria-hidden />
              {label}
            </span>
          </div>

          <p className="text-sm text-mist">
            Código{" "}
            <span className="font-semibold text-sea uppercase">
              {reserva.id}
            </span>
          </p>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-md border border-sea/10 bg-background px-3 py-3">
              <p className="mb-1 flex items-center gap-1.5 text-xs uppercase tracking-wider text-mist">
                <CalendarCheck className="h-3.5 w-3.5 text-coral" aria-hidden />
                Check-in
              </p>
              <p className="font-medium text-sea">
                {formatearFecha(reserva.checkIn)}
              </p>
            </div>
            <div className="rounded-md border border-sea/10 bg-background px-3 py-3">
              <p className="mb-1 flex items-center gap-1.5 text-xs uppercase tracking-wider text-mist">
                <CalendarX2 className="h-3.5 w-3.5 text-coral" aria-hidden />
                Check-out
              </p>
              <p className="font-medium text-sea">
                {formatearFecha(reserva.checkOut)}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 text-sm">
            <span className="inline-flex items-center gap-1.5 rounded-md border border-sea/10 bg-background px-3 py-2 text-sea">
              <Moon className="h-4 w-4 text-coral" aria-hidden />
              {noches} noche{noches === 1 ? "" : "s"}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-md border border-sea/10 bg-background px-3 py-2 text-sea">
              <Users className="h-4 w-4 text-coral" aria-hidden />
              {textoHuespedes(reserva)}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-md border border-sea/10 bg-background px-3 py-2 text-sea">
              <BedDouble className="h-4 w-4 text-coral" aria-hidden />
              {formatearPrecio(reserva.precioPorNoche)} / noche
            </span>
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-sea/10 pt-4">
            <span className="text-xs uppercase tracking-wider text-mist">
              Total
            </span>
            <span className="text-2xl font-semibold text-sea">
              {formatearPrecio(reserva.total)}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-md border border-sea/20 px-4 py-3 font-semibold text-sea transition hover:bg-background"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
