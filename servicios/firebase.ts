/**
 * Inicialización del SDK de Firebase.
 *
 * Las credenciales salen de `.env.local`, que NO se sube al repositorio.
 * Cada quien crea el suyo a partir de `.env.local.example`.
 *
 * Sobre la apiKey: no es un secreto. Identifica al proyecto, no autoriza
 * nada, y Google la expone en el navegador a propósito. Lo que protege los
 * datos son las reglas de `firestore.rules`, que corren en el servidor.
 * Aun así va en el .env para no dejar credenciales dentro del código.
 */

import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

/**
 * `true` solo si están TODAS las credenciales.
 *
 * Esto permite que un compañero clone el repo sin `.env.local` y el sitio
 * siga funcionando con datos mock, en lugar de reventar al arrancar.
 */
export const firebaseConfigurado: boolean = Object.values(config).every(
  (v) => typeof v === "string" && v.length > 0,
);

let app: FirebaseApp | null = null;

function iniciar(): FirebaseApp {
  if (!firebaseConfigurado) {
    throw new Error(
      "Firebase no está configurado. Copia .env.local.example a .env.local " +
        "y completa las credenciales del proyecto.",
    );
  }

  if (app) return app;

  // getApps() evita reinicializar en cada recarga del Fast Refresh de Next,
  // que si no lanza "Firebase App named '[DEFAULT]' already exists".
  app = getApps().length
    ? getApp()
    : initializeApp(config as Record<keyof typeof config, string>);

  return app;
}

/**
 * Se inicializan de forma perezosa: solo cuando alguien los pide.
 *
 * Esto importa en Next, donde los módulos también se cargan en el servidor
 * durante el renderizado. Si inicializáramos al importar, un compañero sin
 * `.env.local` no podría ni abrir el sitio.
 */
export function obtenerAuth(): Auth {
  return getAuth(iniciar());
}

export function obtenerDb(): Firestore {
  return getFirestore(iniciar());
}
