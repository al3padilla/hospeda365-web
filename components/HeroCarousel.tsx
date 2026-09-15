"use client";

import { useEffect, useState } from "react";
import { IMAGENES_INICIO, INTERVALO_CARRUSEL_MS } from "../datos/inicio";

export default function HeroCarousel() {
  const [index, setIndex] = useState(0);
  const total = IMAGENES_INICIO.length;
  const tieneImagenes = total > 0;

  useEffect(() => {
    if (!tieneImagenes) return;

    const id = window.setInterval(() => {
      setIndex((actual) => (actual + 1) % total);
    }, INTERVALO_CARRUSEL_MS);

    return () => window.clearInterval(id);
  }, [index, total, tieneImagenes]);

  return (
    <section className="relative min-h-[88vh] flex items-end sm:items-center overflow-hidden bg-sea-deep">
      {tieneImagenes
        ? IMAGENES_INICIO.map((src, i) => (
            <img
              key={src}
              src={src}
              alt=""
              aria-hidden={i !== index}
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ease-in-out ${
                i === index ? "z-[1] opacity-100" : "z-0 opacity-0"
              }`}
            />
          ))
        : null}

      <div
        className="absolute inset-0 z-[2] pointer-events-none"
        style={{
          background:
            "linear-gradient(90deg, rgba(8,42,71,0.72) 0%, rgba(8,42,71,0.35) 55%, rgba(8,42,71,0.2) 100%)",
        }}
      />

      <div className="relative z-[3] container mx-auto px-4 pb-24 pt-20 sm:py-0 max-w-3xl">
        <p className="font-[family-name:var(--font-script)] text-3xl sm:text-4xl text-white/90 mb-2 animate-fade-up">
          Toma un break
        </p>
        <h1 className="font-[family-name:var(--font-display)] text-5xl sm:text-6xl md:text-7xl text-white leading-[1.05] mb-5 animate-fade-up-delay">
          Hotel Terra Azul
        </h1>
        <p className="text-lg text-white/85 max-w-md mb-8 leading-relaxed animate-fade-up-delay-2">
          Hotel de playa para vacaciones inolvidables. Reserva tu habitación
          ideal con check-in sencillo y atención personalizada.
        </p>
        <div className="flex flex-wrap gap-3 animate-fade-up-delay-2">
          <a
            href="#buscar"
            className="bg-coral text-white px-7 py-3 rounded-md font-semibold tracking-wide hover:bg-coral-hover transition"
          >
            RESERVAR AHORA
          </a>
          <a
            href="#habitaciones"
            className="border border-white/70 text-white px-7 py-3 rounded-md font-semibold tracking-wide hover:bg-white/10 transition"
          >
            Ver habitaciones
          </a>
        </div>
      </div>

      {tieneImagenes ? (
        <div className="absolute bottom-8 left-1/2 z-[3] flex -translate-x-1/2 gap-2">
          {IMAGENES_INICIO.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Ir a foto ${i + 1}`}
              aria-current={i === index}
              onClick={() => setIndex(i)}
              className={`h-2.5 rounded-full transition-all ${
                i === index
                  ? "w-7 bg-coral"
                  : "w-2.5 bg-white/55 hover:bg-white/85"
              }`}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}
