import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  type DocumentData,
  type QueryDocumentSnapshot,
  type Unsubscribe,
} from "firebase/firestore";

import { obtenerDb } from "./firebase";
import type {
  EstadoHabitacion,
  EstadoPago,
  Habitacion,
  HabitacionAdmin,
  NuevaReserva,
  Reserva,
  ReservaAdmin,
} from "./tiposHotel";

const ESTADO_HABITACION_DB: Record<EstadoHabitacion, string> = {
  AVAILABLE: "disponible",
  OCCUPIED: "ocupada",
  CLEANING: "limpieza",
  MAINTENANCE: "mantenimiento",
};

const ESTADO_HABITACION_APP: Record<string, EstadoHabitacion> = {
  disponible: "AVAILABLE",
  ocupada: "OCCUPIED",
  limpieza: "CLEANING",
  mantenimiento: "MAINTENANCE",
};

const ESTADO_RESERVA_APP: Record<string, Reserva["status"]> = {
  pendiente: "PENDING",
  confirmada: "CONFIRMED",
  en_curso: "IN_PROGRESS",
  finalizada: "COMPLETED",
  cancelada: "CANCELLED",
  rechazada: "REJECTED",
};

const ESTADO_RESERVA_DB: Record<Reserva["status"], string> = {
  PENDING: "pendiente",
  CONFIRMED: "confirmada",
  IN_PROGRESS: "en_curso",
  COMPLETED: "finalizada",
  CANCELLED: "cancelada",
  REJECTED: "rechazada",
};

const ESTADO_PAGO_APP: Record<string, EstadoPago> = {
  sin_comprobante: "PENDING",
  en_revision: "PENDING",
  aprobado: "APPROVED",
  rechazado: "REJECTED",
};

const ESTADO_PAGO_DB: Record<EstadoPago, string> = {
  PENDING: "en_revision",
  APPROVED: "aprobado",
  REJECTED: "rechazado",
};

function texto(data: DocumentData, campo: string, fallback = ""): string {
  return typeof data[campo] === "string" ? data[campo] : fallback;
}

function numero(data: DocumentData, campo: string, fallback = 0): number {
  return typeof data[campo] === "number" ? data[campo] : fallback;
}

function crearSuscripcion(
  factory: () => Unsubscribe,
  onError: (error: Error) => void,
): Unsubscribe {
  try {
    return factory();
  } catch (cause) {
    const error =
      cause instanceof Error ? cause : new Error("Error de suscripción.");
    queueMicrotask(() => onError(error));
    return () => undefined;
  }
}

function mapearHabitacion(
  snapshot: QueryDocumentSnapshot<DocumentData>,
): Habitacion {
  const data = snapshot.data();
  const imagenes = Array.isArray(data.imagenes)
    ? data.imagenes.filter((item): item is string => typeof item === "string")
    : [];
  const amenidades = Array.isArray(data.amenidades)
    ? data.amenidades.filter((item): item is string => typeof item === "string")
    : [];

  return {
    id: snapshot.id,
    number: texto(data, "numero", snapshot.id),
    floor: numero(data, "piso"),
    name: texto(data, "nombre", texto(data, "tipo", snapshot.id)),
    description: texto(data, "descripcion"),
    pricePerNight: numero(data, "precioNoche"),
    capacity: numero(data, "capacidad", 1),
    imageUrl: imagenes[0] ?? "/imagenes/habitaciones/Hbasica.jpg",
    highlights: amenidades,
    status: ESTADO_HABITACION_APP[texto(data, "estado")] ?? "AVAILABLE",
    active: data.activa !== false,
  };
}

function mapearReserva(
  snapshot: QueryDocumentSnapshot<DocumentData>,
): Reserva {
  const data = snapshot.data();
  const userId = data.usuarioId;

  return {
    id: snapshot.id,
    userId: typeof userId === "string" ? userId : null,
    guestName: texto(data, "huespedNombre", "Huésped"),
    roomId: texto(data, "habitacionId"),
    roomTitle: texto(data, "habitacionNombre", texto(data, "habitacionNumero")),
    roomImageUrl: texto(
      data,
      "habitacionImagenUrl",
      "/imagenes/habitaciones/Hbasica.jpg",
    ),
    checkIn: texto(data, "fechaEntrada"),
    checkOut: texto(data, "fechaSalida"),
    adults: numero(data, "adultos", numero(data, "numeroHuespedes", 1)),
    children: numero(data, "ninos"),
    babies: numero(data, "bebes"),
    nights: numero(data, "noches", 1),
    pricePerNight: numero(data, "precioNoche"),
    amount: numero(data, "total"),
    status: ESTADO_RESERVA_APP[texto(data, "estado")] ?? "PENDING",
    paymentStatus:
      ESTADO_PAGO_APP[texto(data, "estadoPago")] ?? "PENDING",
    proof: texto(data, "comprobanteNombre", "Sin comprobante"),
    proofUrl: texto(data, "comprobanteUrl") || null,
  };
}

function aHabitacionAdmin(habitacion: Habitacion): HabitacionAdmin {
  return {
    id: habitacion.id,
    number: habitacion.number,
    name: habitacion.name,
    title: habitacion.name,
    pricePerNight: habitacion.pricePerNight,
    price: habitacion.pricePerNight,
    status: habitacion.status,
  };
}

export function escucharHabitaciones(
  onData: (habitaciones: Habitacion[]) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  return crearSuscripcion(
    () => {
      const consulta = query(
        collection(obtenerDb(), "rooms"),
        where("activa", "==", true),
      );

      return onSnapshot(
        consulta,
        (snapshot) => {
          const habitaciones = snapshot.docs
            .map(mapearHabitacion)
            .sort((a, b) => a.pricePerNight - b.pricePerNight);
          onData(habitaciones);
        },
        onError,
      );
    },
    onError,
  );
}

export function escucharReservasUsuario(
  userId: string,
  onData: (reservas: Reserva[]) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  return crearSuscripcion(
    () => {
      const consulta = query(
        collection(obtenerDb(), "reservations"),
        where("usuarioId", "==", userId),
        orderBy("fechaEntrada", "desc"),
      );

      return onSnapshot(
        consulta,
        (snapshot) => onData(snapshot.docs.map(mapearReserva)),
        onError,
      );
    },
    onError,
  );
}

export function escucharReservasAdmin(
  onData: (reservas: ReservaAdmin[]) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  return crearSuscripcion(
    () => {
      const consulta = query(
        collection(obtenerDb(), "reservations"),
        orderBy("creadaEn", "desc"),
      );

      return onSnapshot(
        consulta,
        (snapshot) => onData(snapshot.docs.map(mapearReserva)),
        onError,
      );
    },
    onError,
  );
}

export function escucharHabitacionesAdmin(
  onData: (habitaciones: HabitacionAdmin[]) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  return crearSuscripcion(
    () =>
      onSnapshot(
        collection(obtenerDb(), "rooms"),
        (snapshot) =>
          onData(
            snapshot.docs
              .map(mapearHabitacion)
              .map(aHabitacionAdmin)
              .sort((a, b) => a.number.localeCompare(b.number)),
          ),
        onError,
      ),
    onError,
  );
}

export async function crearReserva(input: NuevaReserva): Promise<string> {
  const referencia = await addDoc(collection(obtenerDb(), "reservations"), {
    usuarioId: input.userId,
    habitacionId: input.roomId,
    habitacionNumero: input.roomNumber ?? input.roomId,
    habitacionNombre: input.roomTitle,
    habitacionImagenUrl: input.roomImageUrl,
    huespedNombre: input.guestName,
    fechaEntrada: input.checkIn,
    fechaSalida: input.checkOut,
    numeroHuespedes: input.adults + input.children,
    adultos: input.adults,
    ninos: input.children,
    bebes: input.babies,
    noches: input.nights,
    precioNoche: input.pricePerNight,
    total: input.amount,
    estado: "pendiente",
    estadoPago: input.proof ? "en_revision" : "sin_comprobante",
    comprobanteNombre: input.proof || null,
    comprobanteUrl: input.proofUrl ?? null,
    notas: null,
    creadaEn: serverTimestamp(),
    actualizadaEn: serverTimestamp(),
  });

  return referencia.id;
}

export async function actualizarReserva(
  id: string,
  input: Partial<ReservaAdmin>,
): Promise<void> {
  const cambios: Record<string, unknown> = { actualizadaEn: serverTimestamp() };

  if (input.guestName !== undefined) cambios.huespedNombre = input.guestName;
  if (input.roomId !== undefined) cambios.habitacionId = input.roomId;
  if (input.roomTitle !== undefined) cambios.habitacionNombre = input.roomTitle;
  if (input.roomImageUrl !== undefined) {
    cambios.habitacionImagenUrl = input.roomImageUrl;
  }
  if (input.checkIn !== undefined) cambios.fechaEntrada = input.checkIn;
  if (input.checkOut !== undefined) cambios.fechaSalida = input.checkOut;
  if (input.amount !== undefined) cambios.total = input.amount;
  if (input.proof !== undefined) cambios.comprobanteNombre = input.proof;
  if (input.status !== undefined) {
    cambios.estado = ESTADO_RESERVA_DB[input.status];
  }
  if (input.paymentStatus !== undefined) {
    cambios.estadoPago = ESTADO_PAGO_DB[input.paymentStatus];
  }

  await updateDoc(doc(obtenerDb(), "reservations", id), cambios);
}

export async function cancelarReserva(id: string): Promise<void> {
  await actualizarReserva(id, { status: "CANCELLED" });
}

export async function cambiarEstadoPago(
  id: string,
  paymentStatus: EstadoPago,
): Promise<void> {
  const status =
    paymentStatus === "APPROVED"
      ? "CONFIRMED"
      : paymentStatus === "REJECTED"
        ? "REJECTED"
        : undefined;
  await actualizarReserva(id, { paymentStatus, status });
}

export async function cambiarEstadoHabitacion(
  id: string,
  status: EstadoHabitacion,
): Promise<void> {
  await updateDoc(doc(obtenerDb(), "rooms", id), {
    estado: ESTADO_HABITACION_DB[status],
    actualizadoEn: serverTimestamp(),
  });
}
