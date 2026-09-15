"use client";

import { useState } from "react";
import { TreePalm } from "lucide-react";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-[#e8f4fa]/90 backdrop-blur-sm border-b border-sea/10">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <a href="#" className="group flex items-center gap-2.5 leading-tight">
          <TreePalm className="h-9 w-9 shrink-0 text-sea" aria-hidden />
          <span>
            <span className="block font-[family-name:var(--font-display)] text-xl sm:text-2xl text-sea tracking-tight">
              Hotel terra azul
            </span>
            <span className="block text-[11px] tracking-[0.12em] text-mist">
              by Hospeda365
            </span>
          </span>
        </a>

        <div className="hidden md:flex items-center gap-6">
          <a href="#" className="text-sm text-sea hover:text-coral transition">
            Inicio
          </a>
          <a
            href="#habitaciones"
            className="text-sm text-sea hover:text-coral transition"
          >
            Habitaciones
          </a>
          <a
            href="#amenidades"
            className="text-sm text-sea hover:text-coral transition"
          >
            Amenidades
          </a>
          <a
            href="#daypass"
            className="text-sm text-sea hover:text-coral transition"
          >
            Day Pass
          </a>
          <a
            href="#buscar"
            className="bg-coral text-white text-sm font-semibold tracking-wide px-4 py-2.5 rounded-md hover:bg-coral-hover transition"
          >
            RESERVA AHORA
          </a>
          <button
            type="button"
            className="text-sm text-sea border border-sea/20 px-3 py-2 rounded-md hover:border-sea/40 transition"
          >
            Iniciar sesión
          </button>
        </div>

        <button
          type="button"
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="md:hidden flex h-10 w-10 items-center justify-center rounded-md bg-coral text-white"
        >
          <span className="flex flex-col gap-1.5">
            <span
              className={`block h-0.5 w-5 bg-white transition ${open ? "translate-y-2 rotate-45" : ""}`}
            />
            <span
              className={`block h-0.5 w-5 bg-white transition ${open ? "opacity-0" : ""}`}
            />
            <span
              className={`block h-0.5 w-5 bg-white transition ${open ? "-translate-y-2 -rotate-45" : ""}`}
            />
          </span>
        </button>
      </div>

      {open ? (
        <div className="md:hidden border-t border-sea/10 bg-[#e8f4fa] px-4 py-4 flex flex-col gap-3">
          <a href="#" className="text-sea py-1" onClick={() => setOpen(false)}>
            Inicio
          </a>
          <a
            href="#habitaciones"
            className="text-sea py-1"
            onClick={() => setOpen(false)}
          >
            Habitaciones
          </a>
          <a
            href="#amenidades"
            className="text-sea py-1"
            onClick={() => setOpen(false)}
          >
            Amenidades
          </a>
          <a
            href="#daypass"
            className="text-sea py-1"
            onClick={() => setOpen(false)}
          >
            Day Pass
          </a>
          <a
            href="#buscar"
            className="bg-coral text-white text-center font-semibold py-2.5 rounded-md"
            onClick={() => setOpen(false)}
          >
            RESERVA AHORA
          </a>
          <button
            type="button"
            className="text-sea border border-sea/20 py-2 rounded-md"
          >
            Iniciar sesión
          </button>
        </div>
      ) : null}
    </nav>
  );
}
