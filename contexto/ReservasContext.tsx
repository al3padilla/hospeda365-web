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
  cancelarReserva,
  crearReserva as crearReservaFirestore,
  escucharReservasUsuario,
} from "../servicios/hotelFirestore";
import type { NuevaReserva, Reserva } from "../servicios/tiposHotel";
import { useAuth } from "./AuthContext";

type ReservasContextValue = {
  reservas: Reserva[];
  cargando: boolean;
  guardando: boolean;
  error: string | null;
  crearReserva: (input: Omit<NuevaReserva, "userId" | "guestName">) => Promise<string>;
  cancelarReserva: (id: string) => Promise<void>;
};

const ReservasContext = createContext<ReservasContextValue | null>(null);

export function ReservasProvider({ children }: { children: ReactNode }) {
  const { usuario, estaAutenticado, estaCargando } = useAuth();
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [usuarioSincronizado, setUsuarioSincronizado] = useState<string | null>(
    null,
  );
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (estaCargando || !estaAutenticado || !usuario) return;

    return escucharReservasUsuario(
      usuario.id,
      (datos) => {
        setReservas(datos);
        setUsuarioSincronizado(usuario.id);
        setError(null);
      },
      () => {
        setReservas([]);
        setUsuarioSincronizado(usuario.id);
        setError("No se pudo cargar el historial de reservas.");
      },
    );
  }, [estaAutenticado, estaCargando, usuario]);

  const crearReserva = useCallback(
    async (input: Omit<NuevaReserva, "userId" | "guestName">) => {
      if (!usuario) throw new Error("Se requiere una sesión autenticada.");

      setGuardando(true);
      setError(null);
      try {
        return await crearReservaFirestore({
          ...input,
          userId: usuario.id,
          guestName: `${usuario.nombre} ${usuario.apellido}`.trim(),
        });
      } catch (cause) {
        setError("No se pudo registrar la reserva.");
        throw cause;
      } finally {
        setGuardando(false);
      }
    },
    [usuario],
  );

  const cancelar = useCallback(async (id: string) => {
    await cancelarReserva(id);
  }, []);

  const value = useMemo<ReservasContextValue>(
    () => ({
      reservas:
        usuario && usuarioSincronizado === usuario.id ? reservas : [],
      cargando: Boolean(usuario) && usuarioSincronizado !== usuario?.id,
      guardando,
      error,
      crearReserva,
      cancelarReserva: cancelar,
    }),
    [
      reservas,
      usuario,
      usuarioSincronizado,
      guardando,
      error,
      crearReserva,
      cancelar,
    ],
  );

  return <ReservasContext.Provider value={value}>{children}</ReservasContext.Provider>;
}

export function useReservas(): ReservasContextValue {
  const context = useContext(ReservasContext);
  if (!context) throw new Error("ReservasProvider no está disponible.");
  return context;
}
