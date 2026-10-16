"use client";

import { HabitacionesProvider } from "../contexto/HabitacionesContext";
import { AuthProvider } from "../contexto/AuthContext";
import { AdminProvider } from "../contexto/AdminContext";
import { ReservasProvider } from "../contexto/ReservasContext";

export default function Proveedores({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <HabitacionesProvider>
        <ReservasProvider>
          <AdminProvider>{children}</AdminProvider>
        </ReservasProvider>
      </HabitacionesProvider>
    </AuthProvider>
  );
}
