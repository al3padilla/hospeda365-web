"use client";

import { AlertCircle, X } from "lucide-react";

type BannerErrorProps = {
  mensaje: string;
  onCerrar?: () => void;
};

/**
 * Error que viene del servidor (credenciales inválidas, cuenta desactivada…).
 * Se distingue de los errores por campo: este afecta al formulario completo.
 */
export default function BannerError({ mensaje, onCerrar }: BannerErrorProps) {
  return (
    <div
      role="alert"
      aria-live="polite"
      className="flex items-start gap-2.5 rounded-md border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-700"
    >
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
      <p className="flex-1">{mensaje}</p>

      {onCerrar ? (
        <button
          type="button"
          onClick={onCerrar}
          className="shrink-0 text-red-400 transition hover:text-red-700"
          aria-label="Cerrar mensaje de error"
        >
          <X className="h-4 w-4" aria-hidden />
        </button>
      ) : null}
    </div>
  );
}
