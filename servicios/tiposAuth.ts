/**
 * CONTRATO del servicio de autenticación.
 *
 * Esta es la pieza clave del diseño: ni el Context ni las pantallas saben
 * de dónde salen los datos. Sólo conocen esta interfaz.
 *
 * Hoy la implementa `authMock.ts` (datos falsos en `datos/usuarios.ts`).
 * Mañana la implementará `authFirebase.ts` (Firebase Auth + Firestore).
 * Cambiar de uno a otro es cambiar una línea en `servicios/index.ts`.
 *
 * Es el mismo patrón que sigue el README del proyecto:
 * "La API REST y el estado global completo posteriormente".
 */

import type { Usuario } from "../datos/usuarios";

/** Datos del formulario de inicio de sesión. */
export type Credenciales = {
  email: string;
  password: string;
};

/** Datos del formulario de registro. */
export type DatosRegistro = {
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  password: string;
  confirmPassword: string;
};

/**
 * Sesión activa. El token simula el ID token de Firebase Authentication.
 */
export type Sesion = {
  usuario: Usuario;
  token: string;
  /** Fecha ISO de expiración. */
  expiraEn: string;
};

/** Códigos de error estables, independientes del proveedor. */
export type CodigoErrorAuth =
  | "credenciales_invalidas"
  | "email_ya_registrado"
  | "usuario_inactivo"
  | "usuario_no_encontrado"
  | "password_debil"
  | "sesion_expirada"
  | "error_red"
  | "error_desconocido";

/**
 * Error de autenticación normalizado.
 *
 * Firebase lanza códigos como `auth/wrong-password`; la implementación de
 * Firebase los traducirá a estos códigos, así la interfaz nunca cambia.
 */
export class ErrorAuth extends Error {
  readonly codigo: CodigoErrorAuth;

  constructor(codigo: CodigoErrorAuth, mensaje: string) {
    super(mensaje);
    this.name = "ErrorAuth";
    this.codigo = codigo;
  }
}

/** Mensajes en español listos para mostrar al usuario. */
export const MENSAJES_ERROR: Record<CodigoErrorAuth, string> = {
  credenciales_invalidas: "El correo o la contraseña son incorrectos.",
  email_ya_registrado: "Ya existe una cuenta con este correo electrónico.",
  usuario_inactivo: "Esta cuenta está desactivada. Contacta al hotel.",
  usuario_no_encontrado: "No encontramos una cuenta con ese correo.",
  password_debil: "La contraseña no cumple con los requisitos mínimos.",
  sesion_expirada: "Tu sesión expiró. Vuelve a iniciar sesión.",
  error_red: "No pudimos conectar con el servidor. Revisa tu conexión.",
  error_desconocido: "Ocurrió un error inesperado. Intenta de nuevo.",
};

/**
 * Interfaz que TODA implementación de autenticación debe cumplir.
 *
 * Todos los métodos son asíncronos a propósito: aunque el mock responde
 * casi al instante, Firebase no lo hará, y así la interfaz ya está lista.
 */
export type ServicioAuth = {
  /** Inicia sesión. Lanza `ErrorAuth` si las credenciales no son válidas. */
  login(credenciales: Credenciales): Promise<Sesion>;

  /** Registra un usuario nuevo y lo deja con sesión iniciada. */
  registrar(datos: DatosRegistro): Promise<Sesion>;

  /** Cierra la sesión activa. */
  logout(): Promise<void>;

  /** Recupera la sesión guardada al abrir el sitio. `null` si no hay o expiró. */
  restaurarSesion(): Promise<Sesion | null>;

  /** Actualiza los datos del perfil del usuario autenticado. */
  actualizarPerfil(
    usuarioId: string,
    cambios: Partial<Usuario>,
  ): Promise<Usuario>;
};
