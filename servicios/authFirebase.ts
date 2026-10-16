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

/** El id de cada documento es el UID de Firebase Auth. */
const COLECCION_USUARIOS = "users";

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

function aUsuario(uid: string, datos: Record<string, unknown>): Usuario {
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

async function construirSesion(usuarioFb: UsuarioFirebase): Promise<Sesion> {
  const snap = await getDoc(doc(obtenerDb(), COLECCION_USUARIOS, usuarioFb.uid));

  if (!snap.exists()) {
    // Usuario creado a mano en la consola de Auth sin documento de perfil.
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
      const cred = await createUserWithEmailAndPassword(
        obtenerAuth(),
        datos.email.trim(),
        datos.password,
      );

      await actualizarPerfilAuth(cred.user, {
        displayName: `${datos.nombre.trim()} ${datos.apellido.trim()}`,
      });

      // El rol debe ser "huesped": firestore.rules rechaza cualquier otro.
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
    // currentUser es null hasta que el SDK termina de restaurar la sesión.
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
      return null;
    }
  },

  async actualizarPerfil(
    usuarioId: string,
    cambios: Partial<Usuario>,
  ): Promise<Usuario> {
    const permitidos: Record<string, unknown> = {};
    if (cambios.nombre !== undefined) permitidos.nombre = cambios.nombre;
    if (cambios.apellido !== undefined) permitidos.apellido = cambios.apellido;
    if (cambios.telefono !== undefined) permitidos.telefono = cambios.telefono;

    const ref = doc(obtenerDb(), COLECCION_USUARIOS, usuarioId);
    await updateDoc(ref, { ...permitidos, actualizadoEn: serverTimestamp() });

    const snap = await getDoc(ref);

    if (!snap.exists()) {
      throw new ErrorAuth("usuario_no_encontrado", "El usuario no existe.");
    }

    return aUsuario(usuarioId, snap.data());
  },
};
