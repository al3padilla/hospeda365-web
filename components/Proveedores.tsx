"use client";

import { HabitacionesProvider } from "../contexto/HabitacionesContext";

export default function Proveedores({
  children,
}: {
  children: React.ReactNode;
}) {
  return <HabitacionesProvider>{children}</HabitacionesProvider>;
}
