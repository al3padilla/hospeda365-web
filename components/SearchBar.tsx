"use client";

import { useState, type FormEvent } from "react";
import { CalendarCheck, CalendarX2, Search } from "lucide-react";
import DatePicker from "./DatePicker";
import GuestsPicker, {
  totalParaCapacidad,
  type Huespedes,
} from "./GuestsPicker";
import { Spinner } from "./Loader";
import { useHabitaciones } from "../contexto/HabitacionesContext";
import type { Habitacion } from "../datos/habitaciones";

function mensajeResultado(
  habitaciones: Habitacion[],
  huespedes: Huespedes,
  personas: number,
): string {
  const disponibles = habitaciones.filter((h) => h.capacity >= personas);
  const detalle = [
    `${huespedes.adultos} adulto${huespedes.adultos === 1 ? "" : "s"}`,
    huespedes.ninos
      ? `${huespedes.ninos} niño${huespedes.ninos === 1 ? "" : "s"}`
      : null,
    huespedes.bebes
      ? `${huespedes.bebes} bebé${huespedes.bebes === 1 ? "" : "s"}`
      : null,
  ]
    .filter(Boolean)
    .join(", ");

  return disponibles.length > 0
    ? `${disponibles.length} habitación${disponibles.length === 1 ? "" : "es"} · ${detalle}`
    : `No hay habitaciones para ${personas} o más huéspedes (${detalle})`;
}

export default function SearchBar() {
  const { buscar, habitaciones, cargando } = useHabitaciones();
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [huespedes, setHuespedes] = useState<Huespedes>({
    adultos: 2,
    ninos: 0,
    bebes: 0,
  });
  const [message, setMessage] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (cargando) return;

    const personas = totalParaCapacidad(huespedes);

    buscar({
      checkIn,
      checkOut,
      personas,
      adultos: huespedes.adultos,
      ninos: huespedes.ninos,
      bebes: huespedes.bebes,
    });

    setMessage(mensajeResultado(habitaciones, huespedes, personas));
    document.getElementById("habitaciones")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  function onCheckInChange(value: string) {
    setCheckIn(value);
    if (checkOut && value && checkOut <= value) setCheckOut("");
  }

  return (
    <section
      id="buscar"
      className="relative z-30 mx-auto mb-20 mt-[-2.5rem] w-full max-w-5xl overflow-visible px-4"
    >
      <form
        onSubmit={handleSubmit}
        className="relative z-30 flex flex-col gap-4 overflow-visible rounded-xl border border-sea/10 bg-foam p-4 sm:flex-row sm:items-start sm:p-5"
        style={{ boxShadow: "0 12px 40px rgba(12, 59, 102, 0.12)" }}
      >
        <div className="flex-1">
          <DatePicker
            label="Check-in"
            value={checkIn}
            onChange={onCheckInChange}
            icon={<CalendarCheck className="h-3.5 w-3.5" aria-hidden />}
            placeholder="Fecha de llegada"
          />
        </div>

        <div className="flex-1">
          <DatePicker
            label="Check-out"
            value={checkOut}
            onChange={setCheckOut}
            min={checkIn || undefined}
            icon={<CalendarX2 className="h-3.5 w-3.5" aria-hidden />}
            placeholder="Fecha de salida"
          />
        </div>

        <GuestsPicker value={huespedes} onChange={setHuespedes} />

        <button
          type="submit"
          disabled={cargando}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-coral px-7 py-2.5 font-semibold tracking-wide text-white transition hover:bg-coral-hover disabled:cursor-wait disabled:opacity-80 sm:mt-6"
        >
          {cargando ? (
            <>
              <Spinner className="h-4 w-4 text-white" />
              Buscando…
            </>
          ) : (
            <>
              <Search className="h-4 w-4" aria-hidden />
              Buscar
            </>
          )}
        </button>
      </form>

      {message ? (
        <p className="mt-3 text-center text-sm text-mist">{message}</p>
      ) : null}
    </section>
  );
}
