import { authMock } from "./authMock";
import { authFirebase } from "./authFirebase";
import type { ServicioAuth } from "./tiposAuth";
import { metricasMock } from "./metricasMock";
import type { ServicioMetricas } from "./tiposMetricas";
import { firebaseConfigurado } from "./firebase";

// NEXT_PUBLIC_USAR_MOCKS=true fuerza los mocks aunque haya credenciales.
const FORZAR_MOCKS = process.env.NEXT_PUBLIC_USAR_MOCKS === "true";

export const usandoMocks: boolean = FORZAR_MOCKS || !firebaseConfigurado;

export const servicioAuth: ServicioAuth = usandoMocks ? authMock : authFirebase;

// TODO: implementar con Firestore leyendo metricas/{periodo}.
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
