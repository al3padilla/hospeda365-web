"use client";

import { HabitacionesProvider } from "../contexto/HabitacionesContext";
import { AuthProvider } from "../contexto/AuthContext";
import { AdminProvider } from "../contexto/AdminContext";

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
