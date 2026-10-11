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

/** Sin `.env.local` completo, la app sigue funcionando con datos mock. */
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

  // Evita "Firebase App named '[DEFAULT]' already exists" con Fast Refresh.
  app = getApps().length
    ? getApp()
    : initializeApp(config as Record<keyof typeof config, string>);

  return app;
}

// Inicialización perezosa: Next también importa los módulos en el servidor.
export function obtenerAuth(): Auth {
  return getAuth(iniciar());
}

export function obtenerDb(): Firestore {
  return getFirestore(iniciar());
}
