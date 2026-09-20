/**
 * PUNTO ÚNICO DE CAMBIO entre datos mock y Firebase.
 *
 * Todo el resto de la aplicación importa desde aquí:
 *
 *     import { servicioAuth } from "../servicios";
 *
 * Nadie más sabe si detrás hay datos falsos o Firebase. Ese es el objetivo.
 */

import { authMock } from "./authMock";
import { authFirebase } from "./authFirebase";
import type { ServicioAuth } from "./tiposAuth";
import { metricasMock } from "./metricasMock";
import type { ServicioMetricas } from "./tiposMetricas";
import { firebaseConfigurado } from "./firebase";

/**
 * Se usan mocks cuando NO hay credenciales de Firebase.
 *
 * Así un compañero puede clonar el repo y correr el sitio sin configurar
 * nada: le funciona con datos falsos. En cuanto crea su `.env.local`, la
 * misma app pasa a usar Firebase de verdad, sin tocar código.
 *
 * Para forzar los mocks aun teniendo credenciales (útil para desarrollar
 * sin gastar lecturas), poner en .env.local:
 *
 *     NEXT_PUBLIC_USAR_MOCKS=true
 */
const FORZAR_MOCKS = process.env.NEXT_PUBLIC_USAR_MOCKS === "true";

export const usandoMocks: boolean = FORZAR_MOCKS || !firebaseConfigurado;

export const servicioAuth: ServicioAuth = usandoMocks ? authMock : authFirebase;

// Las métricas todavía no tienen implementación con Firestore: el dashboard
// leerá del documento precalculado metricas/{periodo} cuando exista.
export const servicioMetricas: ServicioMetricas = metricasMock;

export { ErrorAuth, MENSAJES_ERROR } from "./tiposAuth";
export type {
  Credenciales,
  DatosRegistro,
  Sesion,
  ServicioAuth,
  CodigoErrorAuth,
} from "./tiposAuth";
export type { ServicioMetricas } from "./tiposMetricas";
