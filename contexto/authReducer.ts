import type { Usuario } from "../datos/usuarios";
import type { CodigoErrorAuth, Sesion } from "../servicios/tiposAuth";

export type EstadoAuth =
  /** Aún no se sabe si hay sesión guardada. */
  | "inicializando"
  | "no_autenticado"
  /** Login o registro en curso. */
  | "cargando"
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
      if (state.estado !== "autenticado") return state;
      return { ...state, usuario: action.payload };

    case "ERROR_LIMPIADO":
      return { ...state, error: null };

    default:
      return state;
  }
}

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

export function nombreCompleto(state: AuthState): string {
  if (!state.usuario) return "";
  return `${state.usuario.nombre} ${state.usuario.apellido}`.trim();
}

export function iniciales(state: AuthState): string {
  if (!state.usuario) return "";
  const { nombre, apellido } = state.usuario;
  return `${nombre.charAt(0)}${apellido.charAt(0)}`.toUpperCase();
}
