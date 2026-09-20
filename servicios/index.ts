/**
 * PUNTO ÚNICO DE CAMBIO entre mocks y Firebase.
 *
 * Todo el resto de la aplicación importa desde aquí:
 *
 *     import { servicioAuth } from "../servicios";
 *
 * Nadie más sabe si detrás hay datos falsos o Firebase. Ese es el objetivo:
 * cuando llegue el backend real, se cambia esta línea y nada más.
 */

import { authMock } from "./authMock";
import type { ServicioAuth } from "./tiposAuth";

// import { authFirebase } from "./authFirebase";

/** Cambiar a `false` cuando Firebase esté configurado. */
const USAR_MOCKS = true;

export const servicioAuth: ServicioAuth = USAR_MOCKS
  ? authMock
  : authMock; // ← reemplazar por `authFirebase`

export { ErrorAuth, MENSAJES_ERROR } from "./tiposAuth";
export type {
  Credenciales,
  DatosRegistro,
  Sesion,
  ServicioAuth,
  CodigoErrorAuth,
} from "./tiposAuth";
