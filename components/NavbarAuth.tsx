"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown, LogOut, UserCircle2 } from "lucide-react";

import { useAuth } from "../contexto/AuthContext";

/**
 * Sección de sesión del Navbar.
 *
 * Vive en su propio archivo para que el `Navbar.tsx` original cambie lo
 * mínimo posible: allí sólo se reemplazan los dos botones de "Iniciar
 * sesión" que estaban sin conectar.
 *
 * Sin sesión → enlace a /login.
 * Con sesión → avatar con menú desplegable (nombre, mi cuenta, salir).
 */

/** Versión de escritorio, con menú desplegable. */
export default function NavbarAuth() {
  const { estaAutenticado, usuario, nombreCompleto, iniciales, logout, state } =
    useAuth();
  const [abierto, setAbierto] = useState(false);
  const contenedorRef = useRef<HTMLDivElement>(null);

  // Cierra el menú al hacer clic fuera o presionar Escape.
  useEffect(() => {
    if (!abierto) return;

    function alClicFuera(evento: MouseEvent) {
      if (!contenedorRef.current?.contains(evento.target as Node)) {
        setAbierto(false);
      }
    }

    function alEscape(evento: KeyboardEvent) {
      if (evento.key === "Escape") setAbierto(false);
    }

    document.addEventListener("mousedown", alClicFuera);
    document.addEventListener("keydown", alEscape);

    return () => {
      document.removeEventListener("mousedown", alClicFuera);
      document.removeEventListener("keydown", alEscape);
    };
  }, [abierto]);

  // Mientras se restaura la sesión guardada, un espacio neutro evita que
  // el botón "parpadee" de invitado a usuario al cargar la página.
  if (state.estado === "inicializando") {
    return <div className="h-9 w-24 animate-pulse rounded-md bg-sea/10" />;
  }

  if (!estaAutenticado || !usuario) {
    return (
      <Link
        href="/login"
        className="rounded-md border border-sea/20 px-3 py-2 text-sm text-sea transition hover:border-sea/40 hover:text-coral"
      >
        Iniciar sesión
      </Link>
    );
  }

  return (
    <div className="relative" ref={contenedorRef}>
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        aria-expanded={abierto}
        aria-haspopup="menu"
        className="flex items-center gap-2 rounded-md border border-sea/20 py-1.5 pl-1.5 pr-2.5 transition hover:border-sea/40"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-sea text-[11px] font-bold text-white">
          {iniciales}
        </span>
        <span className="max-w-[9rem] truncate text-sm text-sea">
          {usuario.nombre}
        </span>
        <ChevronDown
          className={`h-3.5 w-3.5 text-mist transition-transform ${
            abierto ? "rotate-180" : ""
          }`}
          aria-hidden
        />
      </button>

      {abierto ? (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 w-60 overflow-hidden rounded-lg border border-sea/10 bg-foam shadow-lg"
        >
          <div className="border-b border-sea/10 px-4 py-3">
            <p className="truncate text-sm font-semibold text-sea">
              {nombreCompleto}
            </p>
            <p className="truncate text-xs text-mist">{usuario.email}</p>
          </div>

          <Link
            href="/mi-cuenta"
            role="menuitem"
            onClick={() => setAbierto(false)}
            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-sea transition hover:bg-[#e8f4fa]"
          >
            <UserCircle2 className="h-4 w-4 text-mist" aria-hidden />
            Mi cuenta
          </Link>

          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setAbierto(false);
              void logout();
            }}
            className="flex w-full items-center gap-2.5 border-t border-sea/10 px-4 py-2.5 text-left text-sm text-sea transition hover:bg-[#e8f4fa]"
          >
            <LogOut className="h-4 w-4 text-mist" aria-hidden />
            Cerrar sesión
          </button>
        </div>
      ) : null}
    </div>
  );
}

/** Versión para el menú móvil: sin desplegable, todo a la vista. */
export function NavbarAuthMovil({ onNavegar }: { onNavegar?: () => void }) {
  const { estaAutenticado, usuario, nombreCompleto, iniciales, logout, state } =
    useAuth();

  if (state.estado === "inicializando") {
    return <div className="h-10 animate-pulse rounded-md bg-sea/10" />;
  }

  if (!estaAutenticado || !usuario) {
    return (
      <Link
        href="/login"
        onClick={onNavegar}
        className="rounded-md border border-sea/20 py-2 text-center text-sea"
      >
        Iniciar sesión
      </Link>
    );
  }

  return (
    <div className="flex flex-col gap-2 border-t border-sea/10 pt-3">
      <div className="flex items-center gap-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-sea text-xs font-bold text-white">
          {iniciales}
        </span>
        <span className="min-w-0">
          <span className="block truncate text-sm font-semibold text-sea">
            {nombreCompleto}
          </span>
          <span className="block truncate text-xs text-mist">
            {usuario.email}
          </span>
        </span>
      </div>

      <Link
        href="/mi-cuenta"
        onClick={onNavegar}
        className="rounded-md border border-sea/20 py-2 text-center text-sm text-sea"
      >
        Mi cuenta
      </Link>

      <button
        type="button"
        onClick={() => {
          onNavegar?.();
          void logout();
        }}
        className="rounded-md py-2 text-center text-sm text-mist transition hover:text-coral"
      >
        Cerrar sesión
      </button>
    </div>
  );
}
