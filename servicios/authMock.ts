/**
 * Implementación MOCK del servicio de autenticación.
 *
 * Lee los usuarios de `datos/usuarios.ts` y simula latencia de red usando
 * los mismos `DELAYS` que ya usa el resto del sitio, para que los estados
 * de carga se vean igual que en el buscador de habitaciones.
 *
 * ⚠️ Sólo para desarrollo. Ver la nota de seguridad en `datos/usuarios.ts`.
 */

import { USUARIOS_MOCK, type Usuario, type UsuarioMock } from "../datos/usuarios";
import { DELAYS } from "../datos/carga";
import {
  ErrorAuth,
  type Credenciales,
  type DatosRegistro,
  type ServicioAuth,
  type Sesion,
} from "./tiposAuth";

/** Clave donde se guarda la sesión en el navegador. */
const CLAVE_SESION = "hospeda365.sesion";

/**
 * Copia mutable en memoria. Así un usuario registrado durante la sesión
 * puede iniciar sesión después, sin escribir en el archivo de datos.
 */
const usuarios: UsuarioMock[] = USUARIOS_MOCK.map((u) => ({ ...u }));

function esperar(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Quita la contraseña antes de devolver el usuario a la aplicación. */
function sinPassword(usuario: UsuarioMock): Usuario {
  const { password: _password, ...resto } = usuario;
  return resto;
}

/** Token falso con la misma forma que un JWT (header.payload.firma). */
function generarToken(usuarioId: string): string {
  const payload = btoa(JSON.stringify({ sub: usuarioId, iat: Date.now() }));
  return `mock.${payload}.firma`;
}

function crearSesion(usuario: UsuarioMock): Sesion {
  const expira = new Date();
  expira.setHours(expira.getHours() + 8);

  return {
    usuario: sinPassword(usuario),
    token: generarToken(usuario.id),
    expiraEn: expira.toISOString(),
  };
}

/**
 * Guarda la sesión en `localStorage`.
 *
 * Va envuelto en try/catch porque en modo incógnito, con cookies
 * bloqueadas o durante el renderizado en servidor, `localStorage`
 * no existe o lanza excepción. Que falle el guardado no debe
 * romper el inicio de sesión.
 */
function guardarSesion(sesion: Sesion): void {
  try {
    localStorage.setItem(CLAVE_SESION, JSON.stringify(sesion));
  } catch {
    // Ignorado a propósito: la sesión sigue viva en memoria.
  }
}

function borrarSesion(): void {
  try {
    localStorage.removeItem(CLAVE_SESION);
  } catch {
    // Ignorado a propósito.
  }
}

export const authMock: ServicioAuth = {
  async login({ email, password }: Credenciales): Promise<Sesion> {
    await esperar(DELAYS.busqueda);

    const normalizado = email.trim().toLowerCase();
    const usuario = usuarios.find((u) => u.email.toLowerCase() === normalizado);

    // Mismo mensaje para "no existe" y "contraseña incorrecta": no le
    // revelamos a un atacante qué correos están registrados.
    // Firebase Authentication se comporta igual.
    if (!usuario || usuario.password !== password) {
      throw new ErrorAuth(
        "credenciales_invalidas",
        "Correo o contraseña incorrectos.",
      );
    }

    if (!usuario.activo) {
      throw new ErrorAuth("usuario_inactivo", "La cuenta está desactivada.");
    }

    const sesion = crearSesion(usuario);
    guardarSesion(sesion);
    return sesion;
  },

  async registrar(datos: DatosRegistro): Promise<Sesion> {
    await esperar(DELAYS.confirmar);

    const normalizado = datos.email.trim().toLowerCase();

    if (usuarios.some((u) => u.email.toLowerCase() === normalizado)) {
      throw new ErrorAuth(
        "email_ya_registrado",
        "Ese correo ya está registrado.",
      );
    }

    const nuevo: UsuarioMock = {
      id: `usr_huesped_${Date.now()}`,
      email: normalizado,
      password: datos.password,
      nombre: datos.nombre.trim(),
      apellido: datos.apellido.trim(),
      telefono: datos.telefono.trim() || null,
      // Todo registro público crea un huésped. Los roles de personal los
      // asigna un administrador; nunca se eligen desde el formulario.
      rol: "huesped",
      activo: true,
      creadoEn: new Date().toISOString(),
    };

    usuarios.push(nuevo);

    const sesion = crearSesion(nuevo);
    guardarSesion(sesion);
    return sesion;
  },

  async logout(): Promise<void> {
    await esperar(300);
    borrarSesion();
  },

  async restaurarSesion(): Promise<Sesion | null> {
    let guardado: string | null = null;

    try {
      guardado = localStorage.getItem(CLAVE_SESION);
    } catch {
      return null;
    }

    if (!guardado) return null;

    try {
      const sesion = JSON.parse(guardado) as Sesion;

      if (new Date(sesion.expiraEn).getTime() <= Date.now()) {
        borrarSesion();
        return null;
      }

      return sesion;
    } catch {
      // JSON corrupto: lo descartamos en lugar de romper el arranque.
      borrarSesion();
      return null;
    }
  },

  async actualizarPerfil(
    usuarioId: string,
    cambios: Partial<Usuario>,
  ): Promise<Usuario> {
    await esperar(DELAYS.subida);

    const indice = usuarios.findIndex((u) => u.id === usuarioId);
    if (indice === -1) {
      throw new ErrorAuth("usuario_no_encontrado", "El usuario no existe.");
    }

    const actual = usuarios[indice];

    // Campos que el usuario NO puede cambiar por su cuenta.
    const { id: _id, email: _email, rol: _rol, ...permitidos } = cambios;

    const actualizado: UsuarioMock = { ...actual, ...permitidos };
    usuarios[indice] = actualizado;

    return sinPassword(actualizado);
  },
};
