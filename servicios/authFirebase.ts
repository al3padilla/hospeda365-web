/**
 * Implementación REAL del servicio de autenticación, con Firebase.
 *
 * Implementa EXACTAMENTE la misma interfaz `ServicioAuth` que el mock, así
 * que el Context, las páginas y los componentes no cambian ni una línea.
 * El cambio entre uno y otro vive en `servicios/index.ts`.
 *
 * Reparto de responsabilidades:
 *   Firebase Authentication → correo y contraseña (las contraseñas nunca
 *                             llegan a Firestore; Google las cifra)
 *   Firestore, users/{uid}  → el perfil: nombre, teléfono, rol, activo
 *
 * El UID que genera Authentication es el ID del documento en Firestore.
 * Por eso, con un usuario autenticado, su perfil se encuentra en una lectura.
 */

import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile as actualizarPerfilAuth,
  type User as UsuarioFirebase,
} from "firebase/auth";
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
} from "firebase/firestore";

import { obtenerAuth, obtenerDb } from "./firebase";
import type { Usuario } from "../datos/usuarios";
import {
  ErrorAuth,
  type CodigoErrorAuth,
  type Credenciales,
  type DatosRegistro,
  type ServicioAuth,
  type Sesion,
} from "./tiposAuth";

/** Colección de perfiles. El id de cada documento es el UID de Auth. */
const COLECCION_USUARIOS = "users";

/**
 * Traduce los códigos de Firebase a los NUESTROS.
 *
 * Gracias a esto la interfaz nunca depende del proveedor: las pantallas
 * siguen mostrando los mismos mensajes en español sin saber que existe
 * Firebase. Si mañana cambiamos de backend, solo se reescribe esta función.
 */
function traducirError(codigoFirebase: string): CodigoErrorAuth {
  switch (codigoFirebase) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/invalid-email":
      return "credenciales_invalidas";
    case "auth/user-not-found":
      return "usuario_no_encontrado";
    case "auth/email-already-in-use":
      return "email_ya_registrado";
    case "auth/weak-password":
      return "password_debil";
    case "auth/user-disabled":
      return "usuario_inactivo";
    case "auth/network-request-failed":
      return "error_red";
    default:
      return "error_desconocido";
  }
}

/** Convierte el documento de Firestore al modelo de la app. */
function aUsuario(uid: string, datos: Record<string, unknown>): Usuario {
  // Firestore devuelve Timestamp; la app trabaja con strings ISO.
  const aIso = (v: unknown): string =>
    v instanceof Timestamp ? v.toDate().toISOString() : new Date().toISOString();

  return {
    id: uid,
    email: (datos.email as string) ?? "",
    nombre: (datos.nombre as string) ?? "",
    apellido: (datos.apellido as string) ?? "",
    telefono: (datos.telefono as string | null) ?? null,
    rol: (datos.rol as Usuario["rol"]) ?? "huesped",
    activo: (datos.activo as boolean) ?? true,
    creadoEn: aIso(datos.creadoEn),
  };
}

/** Lee el perfil de Firestore y arma la sesión con el ID token real. */
async function construirSesion(usuarioFb: UsuarioFirebase): Promise<Sesion> {
  const snap = await getDoc(doc(obtenerDb(), COLECCION_USUARIOS, usuarioFb.uid));

  if (!snap.exists()) {
    // Existe en Authentication pero no tiene perfil. Pasa si alguien se creó
    // a mano en la consola sin crear el documento.
    await signOut(obtenerAuth());
    throw new ErrorAuth(
      "usuario_no_encontrado",
      "El perfil de este usuario no existe en la base de datos.",
    );
  }

  const usuario = aUsuario(usuarioFb.uid, snap.data());

  if (!usuario.activo) {
    await signOut(obtenerAuth());
    throw new ErrorAuth("usuario_inactivo", "La cuenta está desactivada.");
  }

  const token = await usuarioFb.getIdTokenResult();

  return { usuario, token: token.token, expiraEn: token.expirationTime };
}

export const authFirebase: ServicioAuth = {
  async login({ email, password }: Credenciales): Promise<Sesion> {
    try {
      const cred = await signInWithEmailAndPassword(
        obtenerAuth(),
        email.trim(),
        password,
      );
      return await construirSesion(cred.user);
    } catch (error) {
      if (error instanceof ErrorAuth) throw error;
      const codigo = (error as { code?: string }).code ?? "";
      throw new ErrorAuth(traducirError(codigo), "No se pudo iniciar sesión.");
    }
  },

  async registrar(datos: DatosRegistro): Promise<Sesion> {
    try {
      // 1. Crear las credenciales en Firebase Authentication.
      const cred = await createUserWithEmailAndPassword(
        obtenerAuth(),
        datos.email.trim(),
        datos.password,
      );

      await actualizarPerfilAuth(cred.user, {
        displayName: `${datos.nombre.trim()} ${datos.apellido.trim()}`,
      });

      // 2. Crear el perfil en Firestore, con el UID como ID del documento.
      //    El rol SIEMPRE es "huesped": las reglas de seguridad impiden que
      //    alguien se auto-asigne admin llamando a la API directamente.
      await setDoc(doc(obtenerDb(), COLECCION_USUARIOS, cred.user.uid), {
        email: datos.email.trim().toLowerCase(),
        nombre: datos.nombre.trim(),
        apellido: datos.apellido.trim(),
        telefono: datos.telefono.trim() || null,
        rol: "huesped",
        activo: true,
        creadoEn: serverTimestamp(),
        actualizadoEn: serverTimestamp(),
      });

      return await construirSesion(cred.user);
    } catch (error) {
      if (error instanceof ErrorAuth) throw error;
      const codigo = (error as { code?: string }).code ?? "";
      throw new ErrorAuth(traducirError(codigo), "No se pudo crear la cuenta.");
    }
  },

  async logout(): Promise<void> {
    await signOut(obtenerAuth());
  },

  async restaurarSesion(): Promise<Sesion | null> {
    // Firebase persiste la sesión por su cuenta. Esperamos a que el SDK
    // termine de restaurarla antes de decidir si hay usuario o no; si
    // preguntáramos de inmediato, siempre diría que no hay nadie.
    const usuarioFb = await new Promise<UsuarioFirebase | null>((resolve) => {
      const cancelar = onAuthStateChanged(obtenerAuth(), (u) => {
        cancelar();
        resolve(u);
      });
    });

    if (!usuarioFb) return null;

    try {
      return await construirSesion(usuarioFb);
    } catch {
      // Perfil ausente o cuenta desactivada: se trata como "sin sesión".
      return null;
    }
  },

  async actualizarPerfil(
    usuarioId: string,
    cambios: Partial<Usuario>,
  ): Promise<Usuario> {
    // Campos que el cliente no puede tocar. Las reglas también lo bloquean:
    // esto es comodidad, la seguridad está en el servidor.
    const {
      id: _id,
      email: _email,
      rol: _rol,
      creadoEn: _creadoEn,
      ...permitidos
    } = cambios;

    const ref = doc(obtenerDb(), COLECCION_USUARIOS, usuarioId);
    await updateDoc(ref, { ...permitidos, actualizadoEn: serverTimestamp() });

    const snap = await getDoc(ref);

    if (!snap.exists()) {
      throw new ErrorAuth("usuario_no_encontrado", "El usuario no existe.");
    }

    return aUsuario(usuarioId, snap.data());
  },
};
