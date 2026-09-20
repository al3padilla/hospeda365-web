"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AtSign, KeyRound, Phone, User, UserPlus } from "lucide-react";

import { useAuth } from "../contexto/AuthContext";
import type { DatosRegistro } from "../servicios/tiposAuth";
import {
  fuerzaPassword,
  sinErrores,
  validarRegistro,
  type ErroresCampo,
} from "../validacion/auth";
import { Spinner } from "./Loader";
import BannerError from "./BannerError";
import CampoAuth from "./CampoAuth";

const DATOS_VACIOS: DatosRegistro = {
  nombre: "",
  apellido: "",
  email: "",
  telefono: "",
  password: "",
  confirmPassword: "",
};

/** Etiqueta y color de cada nivel del indicador de fuerza. */
const NIVELES = [
  { texto: "", color: "bg-sea/15", textoColor: "text-mist" },
  { texto: "Débil", color: "bg-red-500", textoColor: "text-red-600" },
  { texto: "Media", color: "bg-coral", textoColor: "text-coral" },
  { texto: "Fuerte", color: "bg-emerald-500", textoColor: "text-emerald-600" },
] as const;

export default function FormularioRegistro() {
  const router = useRouter();
  const { registrar, estaCargando, error, limpiarError } = useAuth();

  const [datos, setDatos] = useState<DatosRegistro>(DATOS_VACIOS);
  const [errores, setErrores] = useState<ErroresCampo<DatosRegistro>>({});
  /** Hasta el primer envío no validamos: es molesto ver errores mientras se escribe. */
  const [intentoEnvio, setIntentoEnvio] = useState(false);

  function actualizar(campo: keyof DatosRegistro, valor: string) {
    const nuevos = { ...datos, [campo]: valor };
    setDatos(nuevos);

    // Tras el primer intento sí revalidamos en vivo, para dar feedback inmediato.
    if (intentoEnvio) setErrores(validarRegistro(nuevos));
    if (error) limpiarError();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (estaCargando) return;

    setIntentoEnvio(true);

    const nuevosErrores = validarRegistro(datos);
    setErrores(nuevosErrores);
    if (!sinErrores(nuevosErrores)) return;

    const ok = await registrar(datos);
    if (ok) router.push("/mi-cuenta");
  }

  const nivel = fuerzaPassword(datos.password);
  const info = NIVELES[nivel];

  return (
    <section className="mx-auto w-full max-w-lg px-4 py-14">
      <div
        className="animate-fade-up rounded-xl border border-sea/10 bg-foam p-6 sm:p-8"
        style={{ boxShadow: "0 12px 40px rgba(12, 59, 102, 0.12)" }}
      >
        <header className="mb-6">
          <h1 className="font-[family-name:var(--font-display)] text-3xl text-sea">
            Crear cuenta
          </h1>
          <p className="mt-1.5 text-sm text-mist">
            Regístrate para reservar habitaciones en Hotel Terra Azul.
          </p>
        </header>

        {error ? (
          <div className="mb-5">
            <BannerError mensaje={error.mensaje} onCerrar={limpiarError} />
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <CampoAuth
              label="Nombre"
              icono={<User className="h-3.5 w-3.5" aria-hidden />}
              autoComplete="given-name"
              placeholder="Jason"
              value={datos.nombre}
              onChange={(e) => actualizar("nombre", e.target.value)}
              error={errores.nombre}
              disabled={estaCargando}
            />

            <CampoAuth
              label="Apellido"
              icono={<User className="h-3.5 w-3.5" aria-hidden />}
              autoComplete="family-name"
              placeholder="Sosa"
              value={datos.apellido}
              onChange={(e) => actualizar("apellido", e.target.value)}
              error={errores.apellido}
              disabled={estaCargando}
            />
          </div>

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
            label="Teléfono"
            icono={<Phone className="h-3.5 w-3.5" aria-hidden />}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="7123 4567"
            value={datos.telefono}
            onChange={(e) => actualizar("telefono", e.target.value)}
            error={errores.telefono}
            disabled={estaCargando}
          />

          <div>
            <CampoAuth
              label="Contraseña"
              icono={<KeyRound className="h-3.5 w-3.5" aria-hidden />}
              esPassword
              autoComplete="new-password"
              placeholder="Mínimo 8 caracteres"
              value={datos.password}
              onChange={(e) => actualizar("password", e.target.value)}
              error={errores.password}
              disabled={estaCargando}
            />

            {/* Indicador de fuerza: tres barras que se van llenando. */}
            {datos.password.length > 0 ? (
              <div className="mt-2 flex items-center gap-2">
                <div className="flex flex-1 gap-1">
                  {[1, 2, 3].map((i) => (
                    <span
                      key={i}
                      className={`h-1 flex-1 rounded-full transition-colors ${
                        i <= nivel ? info.color : "bg-sea/15"
                      }`}
                    />
                  ))}
                </div>
                <span className={`text-[11px] font-semibold ${info.textoColor}`}>
                  {info.texto}
                </span>
              </div>
            ) : null}
          </div>

          <CampoAuth
            label="Confirmar contraseña"
            icono={<KeyRound className="h-3.5 w-3.5" aria-hidden />}
            esPassword
            autoComplete="new-password"
            placeholder="Repite tu contraseña"
            value={datos.confirmPassword}
            onChange={(e) => actualizar("confirmPassword", e.target.value)}
            error={errores.confirmPassword}
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
                Creando cuenta…
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4" aria-hidden />
                Registrarme
              </>
            )}
          </button>
        </form>

        <p className="mt-6 border-t border-sea/10 pt-5 text-center text-sm text-mist">
          ¿Ya tienes cuenta?{" "}
          <Link
            href="/login"
            className="font-semibold text-sea transition hover:text-coral"
          >
            Inicia sesión
          </Link>
        </p>
      </div>
    </section>
  );
}
