"use client";

import { useCallback, useEffect, useRef } from "react";

/**
 * Ejecuta una acción tras un delay, con cancelación automática al desmontar
 * o al lanzar otra acción.
 */
export function useDelayedAction() {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancel = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => cancel, [cancel]);

  const runAfter = useCallback(
    (ms: number, action: () => void) => {
      cancel();
      timerRef.current = setTimeout(() => {
        timerRef.current = null;
        action();
      }, ms);
    },
    [cancel],
  );

  return { runAfter, cancel };
}
