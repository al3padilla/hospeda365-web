/**
 * Implementación REAL con Firebase (Authentication + Cloud Firestore).
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ ESTE ARCHIVO ESTÁ DESACTIVADO A PROPÓSITO.                          │
 * │ El código está dentro de un comentario para que el proyecto compile │
 * │ sin tener `firebase` instalado todavía.                             │
 * │                                                                      │
 * │ PARA ACTIVARLO:                                                     │
 * │   1. npm install firebase                                           │
 * │   2. Crear `servicios/firebase.ts` con tus credenciales (ver abajo) │
 * │   3. Quitar las marcas de comentario que envuelven el código, y en  │
 * │      `servicios/index.ts` cambiar USAR_MOCKS a false                │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * Lo importante: este archivo implementa EXACTAMENTE la misma interfaz
 * `ServicioAuth` que el mock. Por eso el Context, las páginas y los
 * componentes no cambian ni una línea cuando migremos.
 *
 * ---------------------------------------------------------------------------
 * ARCHIVO `servicios/firebase.ts` (credenciales del proyecto, que salen de
 * Firebase Console → Configuración del proyecto → Tus apps → Web):
 * ---------------------------------------------------------------------------
 *
 *   import { initializeApp, getApps } from "firebase/app";
 *   import { getAuth } from "firebase/auth";
 *   import { getFirestore } from "firebase/firestore";
 *
 *   const firebaseConfig = {
 *     apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
 *     authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
 *     projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
 *     storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
 *     messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_SENDER_ID,
 *     appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
 *   };
 *
 *   // getApps() evita reinicializar en cada recarga del Fast Refresh de Next.
 *   export const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
 *   export const auth = getAuth(app);
 *   export const db = getFirestore(app);
 *
 * Las variables van en `.env.local` (ya está en el .gitignore de Next).
 * El prefijo NEXT_PUBLIC_ es obligatorio para que Next las exponga al cliente.
 *
 * NOTA: la apiKey de Firebase NO es un secreto — identifica al proyecto, no
 * autoriza nada. Lo que protege los datos son las Security Rules del servidor.
 */

/*
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile as actualizarPerfilAuth,
  type User as UsuarioFirebase,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";

import { auth, db } from "./firebase";
import type { Usuario } from "../datos/usuarios";
import {
  ErrorAuth,
  type CodigoErrorAuth,
  type Credenciales,
  type DatosRegistro,
  type ServicioAuth,
  type Sesion,
} from "./tiposAuth";

// Traduce los códigos de Firebase a NUESTROS códigos, para que la interfaz
// no dependa nunca del proveedor.
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

// Firestore devuelve Timestamp; la app trabaja con strings ISO.
function aUsuario(uid: string, datos: Record<string, unknown>): Usuario {
  const aIso = (v: unknown): string =>
    v instanceof Timestamp ? v.toDate().toISOString() : new Date().toISOString();

  return {
    id: uid,
    email: datos.email as string,
    nombre: datos.nombre as string,
    apellido: datos.apellido as string,
    telefono: (datos.telefono as string | null) ?? null,
    rol: datos.rol as Usuario["rol"],
    activo: datos.activo as boolean,
    creadoEn: aIso(datos.creadoEn),
  };
}

async function construirSesion(usuarioFb: UsuarioFirebase): Promise<Sesion> {
  const snap = await getDoc(doc(db, "users", usuarioFb.uid));

  if (!snap.exists()) {
    throw new ErrorAuth("usuario_no_encontrado", "El perfil no existe.");
  }

  const usuario = aUsuario(usuarioFb.uid, snap.data());

  if (!usuario.activo) {
    await signOut(auth);
    throw new ErrorAuth("usuario_inactivo", "La cuenta está desactivada.");
  }

  const token = await usuarioFb.getIdTokenResult();

  return { usuario, token: token.token, expiraEn: token.expirationTime };
}

export const authFirebase: ServicioAuth = {
  async login({ email, password }: Credenciales): Promise<Sesion> {
    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
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
        auth,
        datos.email.trim(),
        datos.password,
      );

      await actualizarPerfilAuth(cred.user, {
        displayName: `${datos.nombre.trim()} ${datos.apellido.trim()}`,
      });

      // 2. Crear el perfil en Firestore, con el UID como ID del documento.
      //    El rol SIEMPRE es 'huesped': las reglas de seguridad impiden que
      //    alguien se auto-asigne 'admin' llamando a la API directamente.
      await setDoc(doc(db, "users", cred.user.uid), {
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
    await signOut(auth);
  },

  async restaurarSesion(): Promise<Sesion | null> {
    // Firebase persiste la sesión solo; esperamos a que el SDK termine
    // de restaurarla antes de decidir si hay usuario o no.
    const usuarioFb = await new Promise<UsuarioFirebase | null>((resolve) => {
      const cancelar = auth.onAuthStateChanged((u) => {
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
    const { id: _id, email: _email, rol: _rol, creadoEn: _c, ...permitidos } = cambios;

    const ref = doc(db, "users", usuarioId);
    await updateDoc(ref, { ...permitidos, actualizadoEn: serverTimestamp() });

    const snap = await getDoc(ref);
    return aUsuario(usuarioId, snap.data() ?? {});
  },
};
*/

export {};
