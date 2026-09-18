"use client";

import { X } from "lucide-react";
import RoomCard from "./RoomCard";
import { useHabitaciones } from "../contexto/HabitacionesContext";

export default function HabitacionesDestacadas() {
  const { habitacionesFiltradas, busqueda, cargando, limpiarBusqueda } =
    useHabitaciones();

  return (
    <section id="habitaciones" className="container mx-auto px-4 py-16 sm:py-20">
      <div className="mb-10">
        <div className="max-w-2xl">
          <p className="mb-1 font-[family-name:var(--font-script)] text-3xl text-mist">
            Tu espacio ideal
          </p>
          <h2 className="mb-3 font-[family-name:var(--font-display)] text-4xl text-sea">
            Nuestras habitaciones
          </h2>
        </div>

        {busqueda ? (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
            <p className="max-w-2xl leading-relaxed text-mist">
              Mostrando habitaciones para{" "}
              <strong className="text-sea">{busqueda.personas}</strong> o más
              huéspedes
              {" · "}
              {busqueda.adultos} adulto{busqueda.adultos === 1 ? "" : "s"}
              {busqueda.ninos > 0
                ? `, ${busqueda.ninos} niño${busqueda.ninos === 1 ? "" : "s"}`
                : ""}
              {busqueda.bebes > 0
                ? `, ${busqueda.bebes} bebé${busqueda.bebes === 1 ? "" : "s"}`
                : ""}
              {busqueda.checkIn && busqueda.checkOut
                ? ` · ${busqueda.checkIn} → ${busqueda.checkOut}`
                : ""}
              .
            </p>
            <button
              type="button"
              onClick={limpiarBusqueda}
              className="inline-flex shrink-0 items-center gap-1.5 self-end text-sm font-medium text-coral transition hover:text-coral-hover sm:self-start"
            >
              <X className="h-4 w-4" aria-hidden />
              Quitar filtro
            </button>
          </div>
        ) : (
          <p className="max-w-2xl leading-relaxed text-mist">
            Desde la opción Básica hasta Platinum: elige el nivel de comodidad
            que mejor se adapte a tu viaje.
          </p>
        )}
      </div>

      {cargando ? (
        <p className="text-center text-mist">Cargando habitaciones…</p>
      ) : habitacionesFiltradas.length === 0 ? (
        <p className="rounded-xl border border-dashed border-sea/20 bg-foam py-12 text-center text-mist">
          No hay habitaciones disponibles para{" "}
          {busqueda?.personas ?? "ese número de"} personas. Prueba con menos
          huéspedes o quita el filtro.
        </p>
      ) : (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {habitacionesFiltradas.map((room) => (
            <RoomCard
              key={room.id}
              {...room}
              checkIn={busqueda?.checkIn}
              checkOut={busqueda?.checkOut}
            />
          ))}
        </div>
      )}
    </section>
  );
}
