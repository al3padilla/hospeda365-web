"use client";

import { X } from "lucide-react";

type FotoLightboxProps = {
  src: string;
  alt: string;
  onClose: () => void;
};

/** Vista ampliada de una foto (tamaño mediano). */
export default function FotoLightbox({ src, alt, onClose }: FotoLightboxProps) {
  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label={alt}
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/90"
        aria-label="Cerrar foto"
        onClick={onClose}
      />
      <button
        type="button"
        onClick={onClose}
        className="absolute top-3 right-3 sm:top-5 sm:right-5 z-20 rounded-md bg-white p-2.5 text-sea hover:bg-white/90 transition"
        aria-label="Cerrar foto ampliada"
      >
        <X className="h-6 w-6" />
      </button>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className="relative z-10 object-contain"
        style={{
          width: "min(85vw, 900px)",
          height: "min(70vh, 620px)",
          maxWidth: "85vw",
          maxHeight: "70vh",
        }}
      />
    </div>
  );
}
