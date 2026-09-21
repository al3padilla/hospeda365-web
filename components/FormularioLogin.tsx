"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AtSign, KeyRound, LogIn } from "lucide-react";

import { useAuth } from "../contexto/AuthContext";
import type { Credenciales } from "../servicios/tiposAuth";
import { sinErrores, validarLogin, type ErroresCampo } from "../validacion/auth";
import { Spinner } from "./Loader";
import BannerError from "./BannerError";
import CampoAuth from "./CampoAuth";

/** A dónde va cada rol después de iniciar sesión. */
const DESTINO_POR_ROL = {
  admin: "/admin",
  recepcionista: "/admin",
  huesped: "/mi-cuenta",
} as const;

export default function FormularioLogin() {
  const router = useRouter();
  const { login, estaAutenticado, usuario, estaCargando, error, limpiarError } =
    useAuth();

  const [datos, setDatos] = useState<Credenciales>({ email: "", password: "" });
  const [errores, setErrores] = useState<ErroresCampo<Credenciales>>({});

  // Si ya hay sesión activa al entrar, no tiene sentido mostrar el login.
  useEffect(() => {
    if (estaAutenticado && usuario) {
      router.replace(DESTINO_POR_ROL[usuario.rol]);
    }
  }, [estaAutenticado, usuario, router]);

  function actualizar(campo: keyof Credenciales, valor: string) {
    setDatos((prev) => ({ ...prev, [campo]: valor }));

    // Limpia el error de ese campo en cuanto el usuario lo corrige.
    if (errores[campo]) setErrores((prev) => ({ ...prev, [campo]: undefined }));
    if (error) limpiarError();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (estaCargando) return;

    const nuevosErrores = validarLogin(datos);
    setErrores(nuevosErrores);
    if (!sinErrores(nuevosErrores)) return;

    const ok = await login({
      email: datos.email.trim(),
      password: datos.password,
    });

    // El Context ya guardó la sesión; sólo navegamos.
    // El useEffect superior redirige según el rol cuando el Context actualiza usuario.
    if (!ok) return;
  }



  return (
    <section className="mx-auto w-full max-w-md px-4 py-14">
      <div
        className="animate-fade-up rounded-xl border border-sea/10 bg-foam p-6 sm:p-8"
        style={{ boxShadow: "0 12px 40px rgba(12, 59, 102, 0.12)" }}
      >
        <header className="mb-6">
          <h1 className="font-[family-name:var(--font-display)] text-3xl text-sea">
            Iniciar sesión
          </h1>
          <p className="mt-1.5 text-sm text-mist">
            Accede para ver tus reservas y gestionar tu estancia.
          </p>
        </header>

        {error ? (
          <div className="mb-5">
            <BannerError mensaje={error.mensaje} onCerrar={limpiarError} />
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          <CampoAuth
            label="Correo electrónico"
            icono={<AtSign className="h-3.5 w-3.5" aria-hidden />}
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="tu@correo.com"
            value={datos.email}
            onChange={(e) => actualizar("email", e.target.value)}
            error={errores.email}
            disabled={estaCargando}
          />

          <CampoAuth
            label="Contraseña"
            icono={<KeyRound className="h-3.5 w-3.5" aria-hidden />}
            esPassword
            autoComplete="current-password"
            placeholder="••••••••"
            value={datos.password}
            onChange={(e) => actualizar("password", e.target.value)}
            error={errores.password}
            disabled={estaCargando}
          />

          <button
            type="submit"
            disabled={estaCargando}
            className="mt-1 inline-flex items-center justify-center gap-2 rounded-md bg-coral px-7 py-2.5 font-semibold tracking-wide text-white transition hover:bg-coral-hover disabled:cursor-wait disabled:opacity-80"
          >
            {estaCargando ? (
              <>
                <Spinner className="h-4 w-4 text-white" />
                Entrando…
              </>
            ) : (
              <>
                <LogIn className="h-4 w-4" aria-hidden />
                Entrar
              </>
            )}
          </button>
        </form>

        <div className="my-6 flex items-center gap-3">
          <span className="h-px flex-1 bg-sea/10" />
          <span className="text-xs text-mist">o</span>
          <span className="h-px flex-1 bg-sea/10" />
        </div>

        <Link
          href="/registro"
          className="block rounded-md border border-sea/20 py-2.5 text-center text-sm font-semibold text-sea transition hover:border-sea/40 hover:text-coral"
        >
          Crear una cuenta
        </Link>


      </div>
    </section>
  );
}
