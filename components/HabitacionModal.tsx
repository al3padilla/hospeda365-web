"use client";

import { BedDouble, Check, Users, X, ZoomIn } from "lucide-react";
import type { Habitacion } from "../datos/habitaciones";
import { formatearPrecio } from "../datos/reserva";

type HabitacionModalProps = {
  habitacion: Pick<
    Habitacion,
    "id" | "name" | "description" | "pricePerNight" | "capacity" | "imageUrl" | "highlights"
  >;
  reservarHref: string;
  onClose: () => void;
  onAmpliarFoto: () => void;
};

export default function HabitacionModal({
  habitacion,
  reservarHref,
  onClose,
  onAmpliarFoto,
}: HabitacionModalProps) {
  const {
    id,
    name,
    description,
    pricePerNight,
    capacity,
    imageUrl,
    highlights,
  } = habitacion;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby={`room-modal-${id}`}
    >
      <button
        type="button"
        className="absolute inset-0 bg-sea-deep/55"
        aria-label="Cerrar"
        onClick={onClose}
      />

      <div className="relative z-10 w-full sm:max-w-2xl max-h-[92vh] overflow-y-auto bg-foam rounded-t-2xl sm:rounded-2xl border border-sea/10">
        <div className="relative h-52 sm:h-64 bg-sea/15">
          <button
            type="button"
            onClick={onAmpliarFoto}
            className="group/img relative h-full w-full overflow-hidden text-left"
            aria-label={`Ampliar foto de ${name}`}
            disabled={!imageUrl}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt={name}
              className="h-full w-full object-cover transition group-hover/img:scale-[1.02]"
            />
            <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-md bg-black/55 text-white text-xs font-medium px-2.5 py-1.5">
              <ZoomIn className="h-3.5 w-3.5" aria-hidden />
              Ampliar foto
            </span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3 right-3 z-10 rounded-md bg-white/95 p-2 text-sea hover:bg-white transition"
            aria-label="Cerrar modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5 sm:p-7 space-y-5">
          <div>
            <p className="font-[family-name:var(--font-script)] text-2xl text-mist mb-0.5">
              Detalle de habitación
            </p>
            <h2
              id={`room-modal-${id}`}
              className="font-[family-name:var(--font-display)] text-3xl text-sea"
            >
              {name}
            </h2>
          </div>

          <p className="text-mist leading-relaxed">{description}</p>

          <div className="flex flex-wrap gap-3 text-sm">
            <span className="inline-flex items-center gap-1.5 rounded-md border border-sea/10 bg-background px-3 py-2 text-sea">
              <Users className="h-4 w-4 text-coral" aria-hidden />
              Hasta {capacity} persona{capacity === 1 ? "" : "s"}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-md border border-sea/10 bg-background px-3 py-2 text-sea">
              <BedDouble className="h-4 w-4 text-coral" aria-hidden />
              {formatearPrecio(pricePerNight)} / noche
            </span>
          </div>

          {highlights.length > 0 ? (
            <div>
              <h3 className="font-semibold text-sea mb-3 tracking-wide">
                Incluye
              </h3>
              <ul className="space-y-2">
                {highlights.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2.5 text-sm text-mist"
                  >
                    <Check
                      className="h-4 w-4 text-coral shrink-0 mt-0.5"
                      aria-hidden
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="sticky bottom-0 pt-2 pb-1 bg-foam flex flex-col sm:flex-row gap-2">
            <button
              type="button"
              onClick={onClose}
              className="sm:flex-1 border border-sea/20 text-sea px-4 py-3 rounded-md font-semibold hover:bg-background transition"
            >
              Cerrar
            </button>
            <a
              href={reservarHref}
              className="sm:flex-1 text-center bg-coral text-white px-4 py-3 rounded-md font-semibold tracking-wide hover:bg-coral-hover transition"
            >
              Reservar
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
