"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BedDouble,
  CalendarRange,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Users,
  type LucideIcon,
} from "lucide-react";

import { useAuth } from "../contexto/AuthContext";
import type { Rol } from "../datos/usuarios";
import { PageLoader, Spinner } from "./Loader";

type Opcion = {
  titulo: string;
  descripcion: string;
  href: string;
  icono: LucideIcon;
  /** `false` mientras el módulo del compañero no exista. */
  disponible: boolean;
};

/**
 * Menú por rol.
 *
 * Cada entrada con `disponible: false` es un punto de integración que espera
 * al módulo correspondiente del equipo. Cuando ese módulo exista, se cambia
 * el `href` y se pone `disponible: true`.
 */
const OPCIONES_POR_ROL: Record<Rol, Opcion[]> = {
  huesped: [
    {
      titulo: "Mis reservas",
      descripcion: "Historial de tus estancias y comprobantes de pago.",
      href: "/historial",
      icono: CalendarRange,
      disponible: true,
    },
    {
      titulo: "Ver habitaciones",
      descripcion: "Explora el catálogo y reserva tu próxima estancia.",
      href: "/#habitaciones",
      icono: BedDouble,
      disponible: true,
    },
  ],
  recepcionista: [
    {
      titulo: "Panel de gestión",
      descripcion:
        "Listar reservas, validar comprobantes y cambiar estados de habitaciones.",
      href: "#",
      icono: ClipboardList,
      disponible: false,
    },
    {
      titulo: "Habitaciones",
      descripcion: "Disponible, Ocupada, Limpieza.",
      href: "#",
      icono: BedDouble,
      disponible: false,
    },
    {
      titulo: "Mis reservas",
      descripcion: "Historial de reservas del sistema.",
      href: "/historial",
      icono: CalendarRange,
      disponible: true,
    },
  ],
  admin: [
    {
      titulo: "Dashboard",
      descripcion:
        "Ocupación, ganancias mensuales y reservas pendientes.",
      href: "#",
      icono: LayoutDashboard,
      disponible: false,
    },
    {
      titulo: "Panel de gestión",
      descripcion: "Reservas, comprobantes y estados de habitaciones.",
      href: "#",
      icono: ClipboardList,
      disponible: false,
    },
    {
      titulo: "Usuarios",
      descripcion: "Gestionar el personal y los roles del sistema.",
      href: "#",
      icono: Users,
      disponible: false,
    },
    {
      titulo: "Mis reservas",
      descripcion: "Historial de reservas del sistema.",
      href: "/historial",
      icono: CalendarRange,
      disponible: true,
    },
  ],
};

const ETIQUETA_ROL: Record<Rol, string> = {
  huesped: "Huésped",
  recepcionista: "Recepción",
  admin: "Administrador",
};

export default function PanelCuenta() {
  const router = useRouter();
  const { usuario, nombreCompleto, iniciales, estaAutenticado, state, logout } =
    useAuth();

  // Ruta protegida: sin sesión, de vuelta al login.
  useEffect(() => {
    if (state.estado === "no_autenticado") router.replace("/login");
  }, [state.estado, router]);

  // Mientras se restaura la sesión guardada, evitamos el parpadeo de
  // mandar al login a alguien que sí estaba autenticado.
  if (state.estado === "inicializando") {
    return <PageLoader titulo="Verificando tu sesión…" />;
  }

  if (!estaAutenticado || !usuario) {
    return <PageLoader titulo="Redirigiendo al inicio de sesión…" />;
  }

  const opciones = OPCIONES_POR_ROL[usuario.rol];

  return (
    <section className="mx-auto w-full max-w-4xl px-4 py-12">
      {/* Cabecera con el usuario de la sesión */}
      <header className="animate-fade-up mb-8 flex flex-col items-start gap-4 rounded-xl border border-sea/10 bg-foam p-6 sm:flex-row sm:items-center">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-sea text-xl font-bold text-white">
          {iniciales}
        </div>

        <div className="flex-1">
          <p className="text-xs uppercase tracking-[0.12em] text-mist">
            {ETIQUETA_ROL[usuario.rol]}
          </p>
          <h1 className="font-[family-name:var(--font-display)] text-2xl text-sea sm:text-3xl">
            Hola, {nombreCompleto}
          </h1>
          <p className="mt-0.5 text-sm text-mist">{usuario.email}</p>
        </div>

        <button
          type="button"
          onClick={() => void logout()}
          disabled={state.estado === "cargando"}
          className="inline-flex items-center gap-2 rounded-md border border-sea/20 px-4 py-2 text-sm font-semibold text-sea transition hover:border-sea/40 hover:text-coral disabled:opacity-60"
        >
          {state.estado === "cargando" ? (
            <Spinner className="h-4 w-4 text-coral" />
          ) : (
            <LogOut className="h-4 w-4" aria-hidden />
          )}
          Cerrar sesión
        </button>
      </header>

      <h2 className="mb-4 font-[family-name:var(--font-display)] text-xl text-sea">
        ¿Qué quieres hacer?
      </h2>

      <div className="grid gap-4 sm:grid-cols-2">
        {opciones.map((opcion) => {
          const Icono = opcion.icono;

          const contenido = (
            <>
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md ${
                  opcion.disponible
                    ? "bg-coral/10 text-coral"
                    : "bg-sea/5 text-mist"
                }`}
              >
                <Icono className="h-5 w-5" aria-hidden />
              </span>

              <span className="flex-1">
                <span className="flex items-center gap-2">
                  <span className="font-semibold text-sea">{opcion.titulo}</span>
                  {!opcion.disponible ? (
                    <span className="rounded-full bg-sea/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-mist">
                      Próximamente
                    </span>
                  ) : null}
                </span>
                <span className="mt-0.5 block text-sm text-mist">
                  {opcion.descripcion}
                </span>
              </span>
            </>
          );

          // Los módulos que aún no existen se muestran, pero no navegan.
          return opcion.disponible ? (
            <Link
              key={opcion.titulo}
              href={opcion.href}
              className="flex items-start gap-3.5 rounded-xl border border-sea/10 bg-foam p-5 transition hover:border-coral/40 hover:shadow-md"
            >
              {contenido}
            </Link>
          ) : (
            <div
              key={opcion.titulo}
              aria-disabled
              className="flex cursor-not-allowed items-start gap-3.5 rounded-xl border border-dashed border-sea/15 bg-foam/60 p-5"
            >
              {contenido}
            </div>
          );
        })}
      </div>

      <p className="mt-6 text-center text-xs text-mist">
        Los módulos marcados como “Próximamente” se habilitarán cuando el equipo
        integre el Dashboard y el Panel de Gestión.
      </p>
    </section>
  );
}
