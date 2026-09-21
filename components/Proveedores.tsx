"use client";

import { HabitacionesProvider } from "../contexto/HabitacionesContext";
import { AuthProvider } from "../contexto/AuthContext";
import { AdminProvider } from "../contexto/AdminContext";

/**
 * Providers globales de la aplicación.
 *
 * `AuthProvider` va por fuera a propósito: la sesión es la que manda, y
 * más adelante el catálogo podrá depender de quién está autenticado
 * (tarifas por rol, reservas del usuario), no al revés.
 */
export default function Proveedores({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <HabitacionesProvider><AdminProvider>{children}</AdminProvider></HabitacionesProvider>
    </AuthProvider>
  );
}
