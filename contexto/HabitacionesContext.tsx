"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { escucharHabitaciones } from "../servicios/hotelFirestore";
import type { Habitacion } from "../servicios/tiposHotel";

export type CriteriosBusqueda = {
  checkIn: string;
  checkOut: string;
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
  error: string | null;
  buscar: (criterios: CriteriosBusqueda) => void;
  limpiarBusqueda: () => void;
  obtenerPorId: (id?: string | null) => Habitacion | undefined;
};

const HabitacionesContext = createContext<HabitacionesContextValue | null>(null);

export function HabitacionesProvider({ children }: { children: ReactNode }) {
  const [habitaciones, setHabitaciones] = useState<Habitacion[]>([]);
  const [busqueda, setBusqueda] = useState<CriteriosBusqueda | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() =>
    escucharHabitaciones(
      (datos) => {
        setHabitaciones(datos);
        setError(null);
        setCargando(false);
      },
      () => {
        setError("No se pudo cargar el catálogo de habitaciones.");
        setCargando(false);
      },
    ), []);

  const habitacionesFiltradas = useMemo(
    () =>
      busqueda
        ? habitaciones.filter(
            (habitacion) =>
              habitacion.capacity >= busqueda.personas &&
              habitacion.status === "AVAILABLE",
          )
        : habitaciones,
    [habitaciones, busqueda],
  );

  const buscar = useCallback((criterios: CriteriosBusqueda) => {
    setBusqueda(criterios);
  }, []);

  const limpiarBusqueda = useCallback(() => setBusqueda(null), []);

  const obtenerPorId = useCallback(
    (id?: string | null) => habitaciones.find((habitacion) => habitacion.id === id),
    [habitaciones],
  );

  const value = useMemo<HabitacionesContextValue>(
    () => ({
      habitaciones,
      habitacionesFiltradas,
      busqueda,
      cargando,
      error,
      buscar,
      limpiarBusqueda,
      obtenerPorId,
    }),
    [
      habitaciones,
      habitacionesFiltradas,
      busqueda,
      cargando,
      error,
      buscar,
      limpiarBusqueda,
      obtenerPorId,
    ],
  );

  return (
    <HabitacionesContext.Provider value={value}>
      {children}
    </HabitacionesContext.Provider>
  );
}

export function useHabitaciones(): HabitacionesContextValue {
  const context = useContext(HabitacionesContext);
  if (!context) throw new Error("HabitacionesProvider no está disponible.");
  return context;
}
