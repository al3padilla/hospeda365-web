/**
 * Reducer del estado global de autenticación.
 *
 * Se separa del Provider a propósito: un reducer es una función pura
 * (mismo estado + misma acción = mismo resultado), así que se puede
 * probar de forma aislada sin renderizar ningún componente.
 */

import type { Usuario } from "../datos/usuarios";
import type { CodigoErrorAuth, Sesion } from "../servicios/tiposAuth";

/**
 * Estado de la sesión como máquina de estados explícita.
 *
 * Usar un campo `estado` en lugar de varios booleanos sueltos
 * (cargando, autenticado, hayError...) evita estados imposibles
 * como "cargando y con error al mismo tiempo".
 */
export type EstadoAuth =
  /** Arrancando: aún no sabemos si hay sesión guardada. */
  | "inicializando"
  /** No hay sesión activa. */
  | "no_autenticado"
  /** Operación en curso (login o registro). */
  | "cargando"
  /** Sesión activa. */
  | "autenticado";

export type ErrorVisible = {
  codigo: CodigoErrorAuth;
  mensaje: string;
};

export type AuthState = {
  estado: EstadoAuth;
  usuario: Usuario | null;
  token: string | null;
  expiraEn: string | null;
  error: ErrorVisible | null;
};

export const estadoInicial: AuthState = {
  estado: "inicializando",
  usuario: null,
  token: null,
  expiraEn: null,
  error: null,
};

export type AuthAction =
  | { type: "RESTAURAR_SESION"; payload: Sesion | null }
  | { type: "OPERACION_INICIADA" }
  | { type: "AUTENTICACION_EXITOSA"; payload: Sesion }
  | { type: "AUTENTICACION_FALLIDA"; payload: ErrorVisible }
  | { type: "SESION_CERRADA" }
  | { type: "PERFIL_ACTUALIZADO"; payload: Usuario }
  | { type: "ERROR_LIMPIADO" };

export function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "RESTAURAR_SESION":
      // Al abrir el sitio: si había sesión guardada y válida, entra directo.
      if (!action.payload) {
        return { ...estadoInicial, estado: "no_autenticado" };
      }
      return {
        estado: "autenticado",
        usuario: action.payload.usuario,
        token: action.payload.token,
        expiraEn: action.payload.expiraEn,
        error: null,
      };

    case "OPERACION_INICIADA":
      // Limpiamos el error anterior al reintentar: si no, el usuario ve
      // el mensaje viejo mientras gira el spinner.
      return { ...state, estado: "cargando", error: null };

    case "AUTENTICACION_EXITOSA":
      return {
        estado: "autenticado",
        usuario: action.payload.usuario,
        token: action.payload.token,
        expiraEn: action.payload.expiraEn,
        error: null,
      };

    case "AUTENTICACION_FALLIDA":
      return {
        estado: "no_autenticado",
        usuario: null,
        token: null,
        expiraEn: null,
        error: action.payload,
      };

    case "SESION_CERRADA":
      return { ...estadoInicial, estado: "no_autenticado" };

    case "PERFIL_ACTUALIZADO":
      // Sólo tiene sentido si hay sesión; si no, ignoramos la acción.
      if (state.estado !== "autenticado") return state;
      return { ...state, usuario: action.payload };

    case "ERROR_LIMPIADO":
      return { ...state, error: null };

    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// Selectores: derivan datos del estado y mantienen en un solo lugar
// la lógica de "¿puede este usuario hacer X?".
// ---------------------------------------------------------------------------

export function estaAutenticado(state: AuthState): boolean {
  return state.estado === "autenticado" && state.usuario !== null;
}

export function estaCargando(state: AuthState): boolean {
  return state.estado === "cargando" || state.estado === "inicializando";
}

/** `true` si el usuario puede entrar al panel administrativo. */
export function esPersonal(state: AuthState): boolean {
  return state.usuario?.rol === "admin" || state.usuario?.rol === "recepcionista";
}

/** Nombre completo, o cadena vacía si no hay sesión. */
export function nombreCompleto(state: AuthState): string {
  if (!state.usuario) return "";
  return `${state.usuario.nombre} ${state.usuario.apellido}`.trim();
}

/** Iniciales para el avatar del Navbar. */
export function iniciales(state: AuthState): string {
  if (!state.usuario) return "";
  const { nombre, apellido } = state.usuario;
  return `${nombre.charAt(0)}${apellido.charAt(0)}`.toUpperCase();
}
