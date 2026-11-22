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

import {
  actualizarHabitacion,
  actualizarReserva,
  cambiarActividadHabitacion,
  cambiarEstadoHabitacion,
  cambiarEstadoPago,
  cancelarReserva,
  crearHabitacion,
  crearReserva,
  escucharHabitacionesAdmin,
  escucharReservasAdmin,
} from "../servicios/hotelFirestore";
import type {
  DatosHabitacion,
  EstadoHabitacion,
  EstadoPago,
  HabitacionAdmin,
  NuevaReserva,
  ReservaAdmin,
} from "../servicios/tiposHotel";
import { useAuth } from "./AuthContext";

type AdminContextValue = {
  reservations: ReservaAdmin[];
  rooms: HabitacionAdmin[];
  loading: boolean;
  error: string | null;
  createReservation: (input: NuevaReserva) => Promise<void>;
  updateReservation: (id: string, input: Partial<ReservaAdmin>) => Promise<void>;
  deleteReservation: (id: string) => Promise<void>;
  setPayment: (id: string, value: EstadoPago) => Promise<void>;
  setRoomStatus: (id: string, value: EstadoHabitacion) => Promise<void>;
  createRoom: (input: DatosHabitacion) => Promise<void>;
  updateRoom: (id: string, input: DatosHabitacion) => Promise<void>;
  setRoomActive: (id: string, active: boolean) => Promise<void>;
};

const AdminContext = createContext<AdminContextValue | null>(null);

export function AdminProvider({ children }: { children: ReactNode }) {
  const { esPersonal, estaCargando, usuario } = useAuth();
  const [reservations, setReservations] = useState<ReservaAdmin[]>([]);
  const [rooms, setRooms] = useState<HabitacionAdmin[]>([]);
  const [usuarioSincronizado, setUsuarioSincronizado] = useState<string | null>(
    null,
  );
  const [reservationsLoading, setReservationsLoading] = useState(true);
  const [roomsLoading, setRoomsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (estaCargando || !esPersonal) return;

    const onError = () => {
      setReservations([]);
      setRooms([]);
      setError("No se pudieron sincronizar los datos administrativos.");
      setReservationsLoading(false);
      setRoomsLoading(false);
    };

    const unsubscribeReservations = escucharReservasAdmin((datos) => {
      setReservations(datos);
      setUsuarioSincronizado(usuario?.id ?? null);
      setReservationsLoading(false);
      setError(null);
    }, onError);

    const unsubscribeRooms = escucharHabitacionesAdmin((datos) => {
      setRooms(datos);
      setRoomsLoading(false);
      setError(null);
    }, onError);

    return () => {
      unsubscribeReservations();
      unsubscribeRooms();
    };
  }, [esPersonal, estaCargando, usuario?.id]);

  const createReservation = useCallback(async (input: NuevaReserva) => {
    await crearReserva(input);
  }, []);

  const updateReservation = useCallback(
    async (id: string, input: Partial<ReservaAdmin>) => {
      await actualizarReserva(id, input);
    },
    [],
  );

  const deleteReservation = useCallback(async (id: string) => {
    await cancelarReserva(id);
  }, []);

  const setPayment = useCallback(async (id: string, value: EstadoPago) => {
    await cambiarEstadoPago(id, value);
  }, []);

  const setRoomStatus = useCallback(
    async (id: string, value: EstadoHabitacion) => {
      await cambiarEstadoHabitacion(id, value);
    },
    [],
  );

  const exigirAdministrador = useCallback(() => {
    if (usuario?.rol !== "admin") {
      throw new Error("Solo un administrador puede gestionar habitaciones.");
    }
  }, [usuario?.rol]);

  const createRoom = useCallback(
    async (input: DatosHabitacion) => {
      exigirAdministrador();
      await crearHabitacion(input);
    },
    [exigirAdministrador],
  );

  const updateRoom = useCallback(
    async (id: string, input: DatosHabitacion) => {
      exigirAdministrador();
      await actualizarHabitacion(id, input);
    },
    [exigirAdministrador],
  );

  const setRoomActive = useCallback(
    async (id: string, active: boolean) => {
      exigirAdministrador();
      await cambiarActividadHabitacion(id, active);
    },
    [exigirAdministrador],
  );

  const value = useMemo<AdminContextValue>(
    () => ({
      reservations:
        usuario && usuarioSincronizado === usuario.id ? reservations : [],
      rooms,
      loading:
        esPersonal &&
        !error &&
        (usuarioSincronizado !== usuario?.id ||
          reservationsLoading ||
          roomsLoading),
      error,
      createReservation,
      updateReservation,
      deleteReservation,
      setPayment,
      setRoomStatus,
      createRoom,
      updateRoom,
      setRoomActive,
    }),
    [
      reservations,
      rooms,
      reservationsLoading,
      roomsLoading,
      esPersonal,
      usuario,
      usuarioSincronizado,
      error,
      createReservation,
      updateReservation,
      deleteReservation,
      setPayment,
      setRoomStatus,
      createRoom,
      updateRoom,
      setRoomActive,
    ],
  );

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdmin(): AdminContextValue {
  const context = useContext(AdminContext);
  if (!context) throw new Error("AdminProvider no está disponible.");
  return context;
}
