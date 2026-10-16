export type Rol = "huesped" | "recepcionista" | "admin";

export type Usuario = {
  id: string;
  email: string;
  nombre: string;
  apellido: string;
  telefono: string | null;
  rol: Rol;
  activo: boolean;
  creadoEn: string;
};
