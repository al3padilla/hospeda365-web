// Solo para desarrollo: contraseñas en texto plano porque es un mock.

export type Rol = "huesped" | "recepcionista" | "admin";

/** Nunca incluye la contraseña. */
export type Usuario = {
  id: string;
  email: string;
  nombre: string;
  apellido: string;
  telefono: string | null;
  rol: Rol;
  activo: boolean;
  /** Fecha ISO 8601. */
  creadoEn: string;
};

export type UsuarioMock = Usuario & { password: string };

export const USUARIOS_MOCK: UsuarioMock[] = [
  {
    id: "usr_admin_001",
    email: "admin@hospeda365.com",
    password: "Admin123",
    nombre: "Alexandra",
    apellido: "Padilla",
    telefono: "+503 7000 0001",
    rol: "admin",
    activo: true,
    creadoEn: "2026-01-15T08:00:00.000Z",
  },
  {
    id: "usr_recep_001",
    email: "recepcion@hospeda365.com",
    password: "Recepcion123",
    nombre: "Jonathan",
    apellido: "Martínez",
    telefono: "+503 7000 0002",
    rol: "recepcionista",
    activo: true,
    creadoEn: "2026-02-02T09:15:00.000Z",
  },
  {
    id: "usr_recep_002",
    email: "marlene@hospeda365.com",
    password: "Marlene123",
    nombre: "Marlene",
    apellido: "Servando",
    telefono: "+503 7746 9978",
    rol: "recepcionista",
    activo: true,
    creadoEn: "2026-02-10T11:00:00.000Z",
  },
  {
    id: "usr_huesped_001",
    email: "jason@example.com",
    password: "Jason123",
    nombre: "Jason",
    apellido: "Sosa",
    telefono: "+503 7000 0003",
    rol: "huesped",
    activo: true,
    creadoEn: "2026-03-12T18:40:00.000Z",
  },
  {
    id: "usr_huesped_002",
    email: "maria.lopez@example.com",
    password: "Maria123",
    nombre: "María",
    apellido: "López",
    telefono: "+503 7000 0004",
    rol: "huesped",
    activo: true,
    creadoEn: "2026-04-22T12:10:00.000Z",
  },
  {
    id: "usr_huesped_003",
    email: "inactivo@example.com",
    password: "Inactivo123",
    nombre: "Carlos",
    apellido: "Ramírez",
    telefono: "+503 7000 0005",
    rol: "huesped",
    // Para probar el bloqueo de cuentas desactivadas.
    activo: false,
    creadoEn: "2026-05-01T07:30:00.000Z",
  },
];

/** Se muestran en la pantalla de login para la demo. */
export const CUENTAS_DEMO = [
  {
    etiqueta: "Administrador",
    email: "admin@hospeda365.com",
    password: "Admin123",
  },
  {
    etiqueta: "Recepcionista",
    email: "recepcion@hospeda365.com",
    password: "Recepcion123",
  },
  {
    etiqueta: "Huésped",
    email: "jason@example.com",
    password: "Jason123",
  },
] as const;
