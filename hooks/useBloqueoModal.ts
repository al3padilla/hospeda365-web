"use client";

import { useEffect } from "react";

/** Bloquea scroll del body y maneja Escape mientras `activo` es true. */
export function useBloqueoModal(activo: boolean, onEscape: () => void) {
  useEffect(() => {
    if (!activo) return;

    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") onEscape();
    }

    document.addEventListener("keydown", handleKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = prev;
    };
  }, [activo, onEscape]);
}
