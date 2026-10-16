import { readFile } from "node:fs/promises";

import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, signOut } from "firebase/auth";
import {
  doc,
  getDoc,
  getFirestore,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

const REQUIRED_ENV = [
  "NEXT_PUBLIC_FIREBASE_API_KEY",
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
  "NEXT_PUBLIC_FIREBASE_SENDER_ID",
  "NEXT_PUBLIC_FIREBASE_APP_ID",
  "FIREBASE_SEED_EMAIL",
  "FIREBASE_SEED_PASSWORD",
];

const missing = REQUIRED_ENV.filter((name) => !process.env[name]);
if (missing.length > 0) {
  throw new Error(`Variables requeridas: ${missing.join(", ")}`);
}

const seedUrl = new URL("./firestore.seed.json", import.meta.url);
const seed = JSON.parse(await readFile(seedUrl, "utf8"));

const app = initializeApp({
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
});

const auth = getAuth(app);
const db = getFirestore(app);

const credential = await signInWithEmailAndPassword(
  auth,
  process.env.FIREBASE_SEED_EMAIL,
  process.env.FIREBASE_SEED_PASSWORD,
);

try {
  await Promise.all(
    seed.rooms.map(({ id, ...room }) =>
      setDoc(
        doc(db, "rooms", id),
        {
          ...room,
          creadaEn: serverTimestamp(),
          actualizadaEn: serverTimestamp(),
        },
        { merge: true },
      ),
    ),
  );

  await Promise.all(
    seed.reservations.map(async ({ id, ...reservation }) => {
      const reference = doc(db, "reservations", id);
      const common = {
        ...reservation,
        numeroHuespedes: reservation.adultos + reservation.ninos,
        comprobanteUrl: null,
        notas: null,
        creadaEn: serverTimestamp(),
        actualizadaEn: serverTimestamp(),
      };

      await setDoc(
        reference,
        {
          ...common,
          usuarioId: credential.user.uid,
          estado: "pendiente",
          estadoPago: "en_revision",
        },
        { merge: true },
      );

      await setDoc(reference, common, { merge: true });
    }),
  );

  const [roomSnapshots, reservationSnapshots] = await Promise.all([
    Promise.all(seed.rooms.map(({ id }) => getDoc(doc(db, "rooms", id)))),
    Promise.all(
      seed.reservations.map(({ id }) => getDoc(doc(db, "reservations", id))),
    ),
  ]);

  const verifiedRooms = roomSnapshots.filter((snapshot) => snapshot.exists()).length;
  const verifiedReservations = reservationSnapshots.filter((snapshot) =>
    snapshot.exists(),
  ).length;

  if (
    verifiedRooms !== seed.rooms.length ||
    verifiedReservations !== seed.reservations.length
  ) {
    throw new Error(
      `Verificación incompleta: ${verifiedRooms} habitaciones y ${verifiedReservations} reservas.`,
    );
  }

  console.info(
    `Migración verificada: ${verifiedRooms} habitaciones y ${verifiedReservations} reservas.`,
  );
} finally {
  await signOut(auth);
}
