"use client";

import { useState, type FormEvent } from "react";

export default function SearchBar() {
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(2);
  const [message, setMessage] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    console.log({ checkIn, checkOut, guests });
    setMessage(
      `Búsqueda simulada: ${checkIn || "—"} → ${checkOut || "—"} · ${guests} persona${guests === 1 ? "" : "s"}`,
    );
  }

  return (
    <section id="buscar" className="relative z-20 w-full max-w-5xl mx-auto px-4 -mt-10 mb-20">
      <form
        onSubmit={handleSubmit}
        className="bg-foam border border-sea/10 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row gap-4 sm:items-end animate-fade-up"
        style={{ boxShadow: "0 12px 40px rgba(12, 59, 102, 0.12)" }}
      >
        <label className="flex flex-col gap-1.5 flex-1 text-left">
          <span className="text-xs font-semibold uppercase tracking-wider text-mist">
            Check-in
          </span>
          <input
            type="date"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            className="border border-sea/15 rounded-md px-3 py-2.5 text-sea bg-white focus:outline-none focus:ring-2 focus:ring-coral/50"
          />
        </label>

        <label className="flex flex-col gap-1.5 flex-1 text-left">
          <span className="text-xs font-semibold uppercase tracking-wider text-mist">
            Check-out
          </span>
          <input
            type="date"
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            className="border border-sea/15 rounded-md px-3 py-2.5 text-sea bg-white focus:outline-none focus:ring-2 focus:ring-coral/50"
          />
        </label>

        <label className="flex flex-col gap-1.5 w-full sm:w-28 text-left">
          <span className="text-xs font-semibold uppercase tracking-wider text-mist">
            Personas
          </span>
          <input
            type="number"
            min={1}
            value={guests}
            onChange={(e) =>
              setGuests(Math.max(1, Number(e.target.value) || 1))
            }
            className="border border-sea/15 rounded-md px-3 py-2.5 text-sea bg-white focus:outline-none focus:ring-2 focus:ring-coral/50"
          />
        </label>

        <button
          type="submit"
          className="bg-coral text-white px-7 py-2.5 rounded-md font-semibold tracking-wide hover:bg-coral-hover transition"
        >
          Buscar
        </button>
      </form>

      {message ? (
        <p className="mt-3 text-center text-sm text-mist">{message}</p>
      ) : null}
    </section>
  );
}
