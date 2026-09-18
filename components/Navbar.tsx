"use client";

import { useState } from "react";
import { Menu, TreePalm, X } from "lucide-react";

const NAV_LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/#habitaciones", label: "Habitaciones" },
  { href: "/#amenidades", label: "Amenidades" },
  { href: "/#daypass", label: "Day Pass" },
  { href: "/historial", label: "Mis reservas" },
] as const;

function Logo() {
  return (
    <a href="/" className="group flex items-center gap-2.5 leading-tight">
      <TreePalm className="h-9 w-9 shrink-0 text-sea" aria-hidden />
      <span>
        <span className="block font-[family-name:var(--font-display)] text-xl tracking-tight text-sea sm:text-2xl">
          Hotel terra azul
        </span>
        <span className="block text-[11px] tracking-[0.12em] text-mist">
          by Hospeda365
        </span>
      </span>
    </a>
  );
}

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-sea/10 bg-[#e8f4fa]/90 backdrop-blur-sm">
      <div className="container mx-auto flex items-center justify-between gap-4 px-4 py-3">
        <Logo />

        <div className="hidden items-center gap-6 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-sea transition hover:text-coral"
            >
              {link.label}
            </a>
          ))}
          <a
            href="/#buscar"
            className="rounded-md bg-coral px-4 py-2.5 text-sm font-semibold tracking-wide text-white transition hover:bg-coral-hover"
          >
            RESERVA AHORA
          </a>
          <button
            type="button"
            className="rounded-md border border-sea/20 px-3 py-2 text-sm text-sea transition hover:border-sea/40"
          >
            Iniciar sesión
          </button>
        </div>

        <button
          type="button"
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="flex h-10 w-10 items-center justify-center rounded-md bg-coral text-white md:hidden"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open ? (
        <div className="flex flex-col gap-3 border-t border-sea/10 bg-[#e8f4fa] px-4 py-4 md:hidden">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="py-1 text-sea"
              onClick={() => setOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <a
            href="/#buscar"
            className="rounded-md bg-coral py-2.5 text-center font-semibold text-white"
            onClick={() => setOpen(false)}
          >
            RESERVA AHORA
          </a>
          <button
            type="button"
            className="rounded-md border border-sea/20 py-2 text-sea"
          >
            Iniciar sesión
          </button>
        </div>
      ) : null}
    </nav>
  );
}
