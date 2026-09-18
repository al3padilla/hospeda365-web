"use client";

import { useCallback, useState } from "react";
import { Eye } from "lucide-react";
import { urlConfirmacion } from "../datos/reserva";
import { useBloqueoModal } from "../hooks/useBloqueoModal";
import HabitacionModal from "./HabitacionModal";
import FotoLightbox from "./FotoLightbox";

type RoomCardProps = {
  id: string;
  name: string;
  description: string;
  pricePerNight: number;
  capacity: number;
  imageUrl: string;
  highlights?: string[];
  checkIn?: string;
  checkOut?: string;
};

export default function RoomCard({
  id,
  name,
  description,
  pricePerNight,
  capacity,
  imageUrl,
  highlights = [],
  checkIn,
  checkOut,
}: RoomCardProps) {
  const [detalleAbierto, setDetalleAbierto] = useState(false);
  const [fotoAmpliada, setFotoAmpliada] = useState(false);

  const reservarHref = urlConfirmacion({
    habitacionId: id,
    checkIn,
    checkOut,
  });

  const cerrarTodo = useCallback(() => {
    setFotoAmpliada(false);
    setDetalleAbierto(false);
  }, []);

  const onEscape = useCallback(() => {
    if (fotoAmpliada) {
      setFotoAmpliada(false);
      return;
    }
    setDetalleAbierto(false);
  }, [fotoAmpliada]);

  useBloqueoModal(detalleAbierto || fotoAmpliada, onEscape);

  return (
    <>
      <article className="group flex flex-col bg-foam overflow-hidden border border-sea/10 rounded-lg transition hover:border-sea/25">
        <button
          type="button"
          onClick={() => setDetalleAbierto(true)}
          className="relative h-56 w-full overflow-hidden bg-sea/20 text-left"
          aria-label={`Ver más sobre habitación ${name}`}
        >
          <div
            className="h-full w-full bg-cover bg-center transition duration-500 group-hover:scale-[1.04]"
            style={{ backgroundImage: `url(${imageUrl})` }}
            role="img"
            aria-hidden
          />
          <span className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-md bg-white/95 px-2.5 py-1.5 text-xs font-semibold text-sea opacity-0 transition group-hover:opacity-100">
            <Eye className="h-3.5 w-3.5 text-coral" aria-hidden />
            Ver más
          </span>
        </button>

        <div className="flex flex-1 flex-col gap-3 p-5">
          <h3 className="font-[family-name:var(--font-display)] text-2xl text-sea">
            {name}
          </h3>
          <p className="flex-1 text-sm leading-relaxed text-mist line-clamp-3">
            {description}
          </p>
          <div className="flex items-center justify-between text-sm">
            <span className="text-mist">
              Hasta {capacity} persona{capacity === 1 ? "" : "s"}
            </span>
            <span className="font-semibold text-sea">
              ${pricePerNight.toLocaleString("es-MX")}
              <span className="font-normal text-mist"> / noche</span>
            </span>
          </div>
          <div className="mt-1 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setDetalleAbierto(true)}
              className="inline-flex items-center justify-center gap-1.5 rounded-md border border-sea/20 px-4 py-2.5 font-semibold tracking-wide text-sea transition hover:border-sea/40 hover:bg-background"
            >
              <Eye className="h-4 w-4 text-coral" aria-hidden />
              Ver más
            </button>
            <a
              href={reservarHref}
              className="inline-flex items-center justify-center rounded-md bg-sea px-4 py-2.5 font-semibold tracking-wide text-white transition hover:bg-sea-deep"
            >
              Reservar
            </a>
          </div>
        </div>
      </article>

      {detalleAbierto ? (
        <HabitacionModal
          habitacion={{
            id,
            name,
            description,
            pricePerNight,
            capacity,
            imageUrl,
            highlights,
          }}
          reservarHref={reservarHref}
          onClose={cerrarTodo}
          onAmpliarFoto={() => setFotoAmpliada(true)}
        />
      ) : null}

      {fotoAmpliada ? (
        <FotoLightbox
          src={imageUrl}
          alt={`${name} — vista ampliada`}
          onClose={() => setFotoAmpliada(false)}
        />
      ) : null}
    </>
  );
}
