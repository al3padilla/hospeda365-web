"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import {
  HABITACIONES_DESTACADAS,
  type Habitacion,
} from "../datos/habitaciones";

type HabitacionesContextValue = {
  habitaciones: Habitacion[];
  cargando: boolean;
  setHabitaciones: (habitaciones: Habitacion[]) => void;
};

const HabitacionesContext = createContext<HabitacionesContextValue | null>(
  null,
);

export function HabitacionesProvider({ children }: { children: ReactNode }) {
  const [habitaciones, setHabitaciones] = useState<Habitacion[]>(
    HABITACIONES_DESTACADAS,
  );
  const [cargando] = useState(false);

  return (
    <HabitacionesContext.Provider
      value={{ habitaciones, cargando, setHabitaciones }}
    >
      {children}
    </HabitacionesContext.Provider>
  );
}

export function useHabitaciones() {
  const ctx = useContext(HabitacionesContext);
  if (!ctx) {
    throw new Error(
      "useHabitaciones debe usarse dentro de HabitacionesProvider",
    );
  }
  return ctx;
}
