import { USUARIOS_MOCK, type Usuario, type UsuarioMock } from "../datos/usuarios";
import { DELAYS } from "../datos/carga";
import {
  ErrorAuth,
  type Credenciales,
  type DatosRegistro,
  type ServicioAuth,
  type Sesion,
} from "./tiposAuth";

const CLAVE_SESION = "hospeda365.sesion";

/** Copia en memoria para que los usuarios registrados puedan iniciar sesión. */
const usuarios: UsuarioMock[] = USUARIOS_MOCK.map((u) => ({ ...u }));

function esperar(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function sinPassword(usuario: UsuarioMock): Usuario {
  const { password: _password, ...resto } = usuario;
  return resto;
}

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

// localStorage puede no existir (SSR) o lanzar (incógnito); no debe romper el login.
function guardarSesion(sesion: Sesion): void {
  try {
    localStorage.setItem(CLAVE_SESION, JSON.stringify(sesion));
  } catch {
    // Ignorado: la sesión sigue en memoria.
  }
}

function borrarSesion(): void {
  try {
    localStorage.removeItem(CLAVE_SESION);
  } catch {
    // Ignorado.
  }
}

export const authMock: ServicioAuth = {
  async login({ email, password }: Credenciales): Promise<Sesion> {
    await esperar(DELAYS.busqueda);

    const normalizado = email.trim().toLowerCase();
    const usuario = usuarios.find((u) => u.email.toLowerCase() === normalizado);

    // Mismo error para ambos casos: no revela qué correos están registrados.
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

    const { id: _id, email: _email, rol: _rol, ...permitidos } = cambios;

    const actualizado: UsuarioMock = { ...actual, ...permitidos };
    usuarios[indice] = actualizado;

    return sinPassword(actualizado);
  },
};
