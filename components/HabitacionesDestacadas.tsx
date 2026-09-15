"use client";

import RoomCard from "./RoomCard";
import { useHabitaciones } from "../contexto/HabitacionesContext";

export default function HabitacionesDestacadas() {
  const { habitaciones, cargando } = useHabitaciones();

  return (
    <section id="habitaciones" className="container mx-auto px-4 py-16 sm:py-20">
      <div className="mb-10 max-w-xl">
        <p className="font-[family-name:var(--font-script)] text-3xl text-mist mb-1">
          Tu espacio ideal
        </p>
        <h2 className="font-[family-name:var(--font-display)] text-4xl text-sea mb-3">
          Nuestras habitaciones
        </h2>
        <p className="text-mist leading-relaxed">
          Desde la opción Básica hasta Platinum: elige el nivel de comodidad
          que mejor se adapte a tu viaje.
        </p>
      </div>

      {cargando ? (
        <p className="text-mist text-center">Cargando habitaciones…</p>
      ) : (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {habitaciones.map((room) => (
            <RoomCard key={room.id} {...room} />
          ))}
        </div>
      )}
    </section>
  );
}
