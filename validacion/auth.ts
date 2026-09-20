/**
 * Validación de los formularios de autenticación.
 *
 * Se valida en el cliente para dar feedback inmediato, PERO estas reglas
 * se repiten del lado del servidor (Firebase Auth + reglas de Firestore).
 * La validación del cliente es comodidad, no seguridad.
 */

import type { Credenciales, DatosRegistro } from "../servicios/tiposAuth";

/** Errores por campo. Si el objeto está vacío, el formulario es válido. */
export type ErroresCampo<T> = Partial<Record<keyof T, string>>;

// Formato de correo. Deliberadamente permisivo: el correo real se confirma
// por verificación de email, no por una expresión regular.
const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Teléfono de El Salvador: 8 dígitos, opcionalmente con +503.
const REGEX_TELEFONO = /^(\+?503[\s-]?)?[267]\d{3}[\s-]?\d{4}$/;

export const REGLAS_PASSWORD = {
  longitudMinima: 8,
  requiereMayuscula: true,
  requiereMinuscula: true,
  requiereNumero: true,
} as const;

/** Devuelve la lista de requisitos que la contraseña NO cumple. */
export function requisitosFaltantes(password: string): string[] {
  const faltantes: string[] = [];

  if (password.length < REGLAS_PASSWORD.longitudMinima) {
    faltantes.push(`al menos ${REGLAS_PASSWORD.longitudMinima} caracteres`);
  }
  if (REGLAS_PASSWORD.requiereMayuscula && !/[A-ZÁÉÍÓÚÑ]/.test(password)) {
    faltantes.push("una letra mayúscula");
  }
  if (REGLAS_PASSWORD.requiereMinuscula && !/[a-záéíóúñ]/.test(password)) {
    faltantes.push("una letra minúscula");
  }
  if (REGLAS_PASSWORD.requiereNumero && !/\d/.test(password)) {
    faltantes.push("un número");
  }

  return faltantes;
}

/**
 * Fuerza de la contraseña, para el indicador visual.
 * 0 = vacía, 1 = débil, 2 = media, 3 = fuerte.
 */
export function fuerzaPassword(password: string): 0 | 1 | 2 | 3 {
  if (password.length === 0) return 0;

  const faltantes = requisitosFaltantes(password).length;
  if (faltantes > 1) return 1;
  if (faltantes === 1) return 2;

  return password.length >= 12 ? 3 : 2;
}

export function validarLogin(datos: Credenciales): ErroresCampo<Credenciales> {
  const errores: ErroresCampo<Credenciales> = {};

  const email = datos.email.trim();
  if (email.length === 0) {
    errores.email = "El correo es obligatorio.";
  } else if (!REGEX_EMAIL.test(email)) {
    errores.email = "Ingresa un correo válido.";
  }

  if (datos.password.length === 0) {
    errores.password = "La contraseña es obligatoria.";
  }

  return errores;
}

export function validarRegistro(
  datos: DatosRegistro,
): ErroresCampo<DatosRegistro> {
  const errores: ErroresCampo<DatosRegistro> = {};

  const nombre = datos.nombre.trim();
  if (nombre.length === 0) {
    errores.nombre = "El nombre es obligatorio.";
  } else if (nombre.length < 2) {
    errores.nombre = "El nombre debe tener al menos 2 caracteres.";
  }

  const apellido = datos.apellido.trim();
  if (apellido.length === 0) {
    errores.apellido = "El apellido es obligatorio.";
  } else if (apellido.length < 2) {
    errores.apellido = "El apellido debe tener al menos 2 caracteres.";
  }

  const email = datos.email.trim();
  if (email.length === 0) {
    errores.email = "El correo es obligatorio.";
  } else if (!REGEX_EMAIL.test(email)) {
    errores.email = "Ingresa un correo válido.";
  }

  const telefono = datos.telefono.trim();
  if (telefono.length === 0) {
    errores.telefono = "El teléfono es obligatorio.";
  } else if (!REGEX_TELEFONO.test(telefono)) {
    errores.telefono = "Ingresa un teléfono válido (ej. 7123 4567).";
  }

  const faltantes = requisitosFaltantes(datos.password);
  if (datos.password.length === 0) {
    errores.password = "La contraseña es obligatoria.";
  } else if (faltantes.length > 0) {
    errores.password = `La contraseña necesita ${faltantes.join(", ")}.`;
  }

  if (datos.confirmPassword.length === 0) {
    errores.confirmPassword = "Confirma tu contraseña.";
  } else if (datos.password !== datos.confirmPassword) {
    errores.confirmPassword = "Las contraseñas no coinciden.";
  }

  return errores;
}

/** `true` si no hay ningún error. */
export function sinErrores<T>(errores: ErroresCampo<T>): boolean {
  return Object.keys(errores).length === 0;
}
