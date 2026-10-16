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

export const firebaseConfigurado: boolean = Object.values(config).every(
  (v) => typeof v === "string" && v.length > 0,
);

let app: FirebaseApp | null = null;

function iniciar(): FirebaseApp {
  if (!firebaseConfigurado) {
    throw new Error(
      "Configuración de Firebase incompleta.",
    );
  }

  if (app) return app;

  app = getApps().length
    ? getApp()
    : initializeApp(config as Record<keyof typeof config, string>);

  return app;
}

export function obtenerAuth(): Auth {
  return getAuth(iniciar());
}

export function obtenerDb(): Firestore {
  return getFirestore(iniciar());
}
