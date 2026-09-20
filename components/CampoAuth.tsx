"use client";

import { useId, useState, type InputHTMLAttributes, type ReactNode } from "react";
import { Eye, EyeOff } from "lucide-react";

type CampoAuthProps = Omit<InputHTMLAttributes<HTMLInputElement>, "id"> & {
  label: string;
  error?: string;
  /** Icono a la izquierda del campo (lucide-react). */
  icono?: ReactNode;
  /** Muestra el botón de ojo para revelar la contraseña. */
  esPassword?: boolean;
};

/** Campo de texto de los formularios de autenticación. */
export default function CampoAuth({
  label,
  error,
  icono,
  esPassword = false,
  ...props
}: CampoAuthProps) {
  const id = useId();
  const idError = `${id}-error`;
  const [visible, setVisible] = useState(false);

  const hayError = Boolean(error);

  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-mist"
      >
        {icono}
        {label}
      </label>

      <div className="relative">
        <input
          {...props}
          id={id}
          type={esPassword && !visible ? "password" : props.type ?? "text"}
          aria-invalid={hayError}
          aria-describedby={hayError ? idError : undefined}
          className={`w-full rounded-md border bg-foam px-3.5 py-2.5 text-sea outline-none transition placeholder:text-mist/60 focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60 ${
            hayError
              ? "border-red-400 focus:border-red-500 focus:ring-red-500/20"
              : "border-sea/15 focus:border-coral focus:ring-coral/20"
          } ${esPassword ? "pr-11" : ""}`}
        />

        {esPassword ? (
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-mist transition hover:text-sea"
            aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
          >
            {visible ? (
              <EyeOff className="h-4 w-4" aria-hidden />
            ) : (
              <Eye className="h-4 w-4" aria-hidden />
            )}
          </button>
        ) : null}
      </div>

      {hayError ? (
        <p id={idError} className="mt-1.5 text-xs text-red-600">
          {error}
        </p>
      ) : null}
    </div>
  );
}
