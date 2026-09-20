"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";

import type { Usuario } from "../datos/usuarios";
import { servicioAuth, ErrorAuth, MENSAJES_ERROR } from "../servicios";
import type { Credenciales, DatosRegistro } from "../servicios/tiposAuth";
import {
  authReducer,
  estadoInicial,
  esPersonal as selEsPersonal,
  estaAutenticado as selEstaAutenticado,
  estaCargando as selEstaCargando,
  iniciales as selIniciales,
  nombreCompleto as selNombreCompleto,
  type AuthState,
  type ErrorVisible,
} from "./authReducer";

/**
 * ESTADO GLOBAL de autenticación (Context API + useReducer).
 *
 * Uso en cualquier componente cliente:
 *
 *     const { usuario, login, logout, estaAutenticado } = useAuth();
 *
 * Detalle de rendimiento: el `value` se memoriza con `useMemo` y las
 * acciones con `useCallback`. Sin eso, cada render del Provider crearía
 * un objeto nuevo y re-renderizaría TODOS los componentes que consumen
 * el contexto, aunque el estado no haya cambiado.
 */
type AuthContextValue = {
  // Estado
  state: AuthState;
  usuario: Usuario | null;
  token: string | null;
  error: ErrorVisible | null;

  // Valores derivados
  estaAutenticado: boolean;
  estaCargando: boolean;
  esPersonal: boolean;
  nombreCompleto: string;
  iniciales: string;

  // Acciones (devuelven `true` si salió bien, para que la página navegue)
  login: (credenciales: Credenciales) => Promise<boolean>;
  registrar: (datos: DatosRegistro) => Promise<boolean>;
  logout: () => Promise<void>;
  actualizarPerfil: (cambios: Partial<Usuario>) => Promise<boolean>;
  limpiarError: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, estadoInicial);

  // Al montar, intenta recuperar la sesión guardada en el navegador.
  useEffect(() => {
    let cancelado = false;

    void (async () => {
      try {
        const sesion = await servicioAuth.restaurarSesion();
        if (!cancelado) dispatch({ type: "RESTAURAR_SESION", payload: sesion });
      } catch {
        if (!cancelado) dispatch({ type: "RESTAURAR_SESION", payload: null });
      }
    })();

    // Evita actualizar el estado si el componente se desmontó mientras
    // la promesa seguía en vuelo.
    return () => {
      cancelado = true;
    };
  }, []);

  /** Normaliza cualquier excepción a nuestro formato de error. */
  const manejarError = useCallback((error: unknown) => {
    const codigo =
      error instanceof ErrorAuth ? error.codigo : "error_desconocido";

    dispatch({
      type: "AUTENTICACION_FALLIDA",
      payload: { codigo, mensaje: MENSAJES_ERROR[codigo] },
    });
  }, []);

  const login = useCallback(
    async (credenciales: Credenciales): Promise<boolean> => {
      dispatch({ type: "OPERACION_INICIADA" });
      try {
        const sesion = await servicioAuth.login(credenciales);
        dispatch({ type: "AUTENTICACION_EXITOSA", payload: sesion });
        return true;
      } catch (error) {
        manejarError(error);
        return false;
      }
    },
    [manejarError],
  );

  const registrar = useCallback(
    async (datos: DatosRegistro): Promise<boolean> => {
      dispatch({ type: "OPERACION_INICIADA" });
      try {
        const sesion = await servicioAuth.registrar(datos);
        dispatch({ type: "AUTENTICACION_EXITOSA", payload: sesion });
        return true;
      } catch (error) {
        manejarError(error);
        return false;
      }
    },
    [manejarError],
  );

  const logout = useCallback(async (): Promise<void> => {
    try {
      await servicioAuth.logout();
    } finally {
      // Pase lo que pase con el servidor, la sesión local se cierra.
      dispatch({ type: "SESION_CERRADA" });
    }
  }, []);

  const actualizarPerfil = useCallback(
    async (cambios: Partial<Usuario>): Promise<boolean> => {
      if (!state.usuario) return false;
      try {
        const actualizado = await servicioAuth.actualizarPerfil(
          state.usuario.id,
          cambios,
        );
        dispatch({ type: "PERFIL_ACTUALIZADO", payload: actualizado });
        return true;
      } catch (error) {
        manejarError(error);
        return false;
      }
    },
    [state.usuario, manejarError],
  );

  const limpiarError = useCallback(() => {
    dispatch({ type: "ERROR_LIMPIADO" });
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      state,
      usuario: state.usuario,
      token: state.token,
      error: state.error,
      estaAutenticado: selEstaAutenticado(state),
      estaCargando: selEstaCargando(state),
      esPersonal: selEsPersonal(state),
      nombreCompleto: selNombreCompleto(state),
      iniciales: selIniciales(state),
      login,
      registrar,
      logout,
      actualizarPerfil,
      limpiarError,
    }),
    [state, login, registrar, logout, actualizarPerfil, limpiarError],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook para consumir el contexto.
 *
 * Lanza un error explícito si se usa fuera del Provider: es mucho mejor
 * un mensaje claro en desarrollo que un `null` silencioso que explota
 * tres componentes más abajo.
 */
export function useAuth(): AuthContextValue {
  const contexto = useContext(AuthContext);

  if (contexto === null) {
    throw new Error("useAuth() debe usarse dentro de un <AuthProvider>.");
  }

  return contexto;
}
