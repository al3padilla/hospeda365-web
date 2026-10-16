import { authFirebase } from "./authFirebase";
import type { ServicioAuth } from "./tiposAuth";

export const servicioAuth: ServicioAuth = authFirebase;

export { ErrorAuth, MENSAJES_ERROR } from "./tiposAuth";
export type {
  Credenciales,
  DatosRegistro,
  Sesion,
  ServicioAuth,
  CodigoErrorAuth,
} from "./tiposAuth";
