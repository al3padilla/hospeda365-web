"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  HABITACIONES_DESTACADAS,
  type Habitacion,
} from "../datos/habitaciones";
import { DELAYS } from "../datos/carga";
import { useDelayedAction } from "../hooks/useDelayedAction";

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
  const [cargando, setCargando] = useState(false);
  const { runAfter, cancel } = useDelayedAction();

  const habitacionesFiltradas = useMemo(
    () =>
      busqueda
        ? habitaciones.filter((h) => h.capacity >= busqueda.personas)
        : habitaciones,
    [habitaciones, busqueda],
  );

  const buscar = useCallback(
    (criterios: CriteriosBusqueda) => {
      setCargando(true);
      runAfter(DELAYS.busqueda, () => {
        setBusqueda(criterios);
        setCargando(false);
      });
    },
    [runAfter],
  );

  const limpiarBusqueda = useCallback(() => {
    cancel();
    setCargando(false);
    setBusqueda(null);
  }, [cancel]);

  const value = useMemo(
    () => ({
      habitaciones,
      habitacionesFiltradas,
      busqueda,
      cargando,
      setHabitaciones,
      buscar,
      limpiarBusqueda,
    }),
    [
      habitaciones,
      habitacionesFiltradas,
      busqueda,
      cargando,
      buscar,
      limpiarBusqueda,
    ],
  );

  return (
    <HabitacionesContext.Provider value={value}>
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
