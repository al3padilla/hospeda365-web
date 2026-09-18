"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import {
  HABITACIONES_DESTACADAS,
  type Habitacion,
} from "../datos/habitaciones";

export type CriteriosBusqueda = {
  checkIn: string;
  checkOut: string;
  /** Total que exige capacidad (adultos + niños). */
  personas: number;
  adultos: number;
  ninos: number;
  bebes: number;
};

type HabitacionesContextValue = {
  habitaciones: Habitacion[];
  habitacionesFiltradas: Habitacion[];
  busqueda: CriteriosBusqueda | null;
  cargando: boolean;
  setHabitaciones: (habitaciones: Habitacion[]) => void;
  buscar: (criterios: CriteriosBusqueda) => void;
  limpiarBusqueda: () => void;
};

const HabitacionesContext = createContext<HabitacionesContextValue | null>(
  null,
);

export function HabitacionesProvider({ children }: { children: ReactNode }) {
  const [habitaciones, setHabitaciones] = useState<Habitacion[]>(
    HABITACIONES_DESTACADAS,
  );
  const [busqueda, setBusqueda] = useState<CriteriosBusqueda | null>(null);
  const [cargando] = useState(false);

  const habitacionesFiltradas = busqueda
    ? habitaciones.filter((h) => h.capacity >= busqueda.personas)
    : habitaciones;

  function buscar(criterios: CriteriosBusqueda) {
    setBusqueda(criterios);
  }

  function limpiarBusqueda() {
    setBusqueda(null);
  }

  return (
    <HabitacionesContext.Provider
      value={{
        habitaciones,
        habitacionesFiltradas,
        busqueda,
        cargando,
        setHabitaciones,
        buscar,
        limpiarBusqueda,
      }}
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
