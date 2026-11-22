import {
  addDoc,
  collection,
  doc,
  getDocs,
  limit,
  onSnapshot,
  query,
  runTransaction,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
  type DocumentData,
  type QueryDocumentSnapshot,
  type Unsubscribe,
} from "firebase/firestore";

import { obtenerDb } from "./firebase";
import type {
  DatosHabitacion,
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

function fechaIso(value: unknown): string {
  if (value instanceof Timestamp) return value.toDate().toISOString().slice(0, 10);
  return typeof value === "string" ? value : "";
}

function fechaCreacion(snapshot: QueryDocumentSnapshot<DocumentData>): number {
  const value = snapshot.get("creadaEn") ?? snapshot.get("createdAt");
  return value instanceof Timestamp ? value.toMillis() : 0;
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
    category: texto(data, "tipo"),
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
    checkIn: fechaIso(data.fechaEntrada),
    checkOut: fechaIso(data.fechaSalida),
    adults: numero(data, "adultos", numero(data, "numeroHuespedes", 1)),
    children: numero(data, "ninos"),
    babies: numero(data, "bebes"),
    nights: numero(data, "noches", 1),
    pricePerNight: numero(data, "precioNoche"),
    amount: numero(data, "total"),
    status: ESTADO_RESERVA_APP[texto(data, "estado")] ?? "PENDING",
    paymentStatus:
      ESTADO_PAGO_APP[texto(data, "estadoPago")] ?? "PENDING",
    paymentUnsubmitted: data.estadoPago === "sin_comprobante",
    proof: texto(data, "comprobanteNombre", "Sin comprobante"),
    proofUrl: texto(data, "comprobanteUrl") || null,
    proofGenerated: data.comprobanteGenerado === true,
  };
}

function aHabitacionAdmin(habitacion: Habitacion): HabitacionAdmin {
  return {
    ...habitacion,
    title: habitacion.name,
    price: habitacion.pricePerNight,
  };
}

function datosHabitacionFirestore(input: DatosHabitacion) {
  return {
    numero: input.number.trim(),
    piso: input.floor,
    nombre: input.name.trim(),
    tipo: input.category.trim().toLocaleLowerCase("es"),
    estado: ESTADO_HABITACION_DB[input.status],
    capacidad: input.capacity,
    precioNoche: input.pricePerNight,
    descripcion: input.description.trim(),
    amenidades: input.highlights.map((item) => item.trim()).filter(Boolean),
    imagenes: [input.imageUrl.trim()],
    activa: input.active,
  };
}

function idHabitacionPorNumero(numero: string): string {
  return `habitacion-${encodeURIComponent(numero.trim().toLocaleLowerCase("es"))}`;
}

async function asegurarNumeroHabitacionDisponible(
  numero: string,
  habitacionId?: string,
): Promise<void> {
  const snapshot = await getDocs(
    query(
      collection(obtenerDb(), "rooms"),
      where("numero", "==", numero.trim()),
      limit(2),
    ),
  );

  const duplicada = snapshot.docs.find((item) => item.id !== habitacionId);
  if (duplicada) {
    throw new Error(`Ya existe una habitación con el número ${numero.trim()}.`);
  }
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
      );

      return onSnapshot(
        consulta,
        (snapshot) =>
          onData(snapshot.docs.map(mapearReserva).sort((a, b) => b.checkIn.localeCompare(a.checkIn))),
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
      return onSnapshot(
        collection(obtenerDb(), "reservations"),
        (snapshot) =>
          onData(snapshot.docs.sort((a, b) => fechaCreacion(b) - fechaCreacion(a)).map(mapearReserva)),
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

export async function cancelarReservaHuesped(id: string): Promise<void> {
  const db = obtenerDb();
  const referencia = doc(db, "reservations", id);
  await runTransaction(db, async (transaction) => {
    const reserva = await transaction.get(referencia);
    const estado = reserva.get("estado");
    if (estado === "cancelada") return;
    if (!["pendiente", "confirmada"].includes(estado)) {
      throw new Error("Esta reserva ya no se puede cancelar.");
    }
    if (reserva.get("estadoPago") !== "sin_comprobante") {
      throw new Error("Esta reserva ya tiene un pago registrado.");
    }
    transaction.update(referencia, {
      estado: "cancelada",
      actualizadaEn: serverTimestamp(),
    });
  });
}

export async function registrarComprobanteSimulado(id: string): Promise<void> {
  await updateDoc(doc(obtenerDb(), "reservations", id), {
    comprobanteNombre: `comprobante-simulado-${id}.pdf`,
    comprobanteGenerado: true,
    comprobanteUrl: null,
    estadoPago: "en_revision",
    actualizadaEn: serverTimestamp(),
  });
}

export async function resolverReservaPendiente(
  id: string,
  status: "CONFIRMED" | "REJECTED",
): Promise<void> {
  const db = obtenerDb();
  const referencia = doc(db, "reservations", id);
  await runTransaction(db, async (transaction) => {
    const reserva = await transaction.get(referencia);
    if (reserva.get("estado") !== "pendiente") {
      throw new Error("La reserva ya fue actualizada.");
    }
    const url = reserva.get("comprobanteUrl");
    if (reserva.get("estadoPago") === "en_revision" &&
        (reserva.get("comprobanteGenerado") === true || (typeof url === "string" && url.startsWith("https://")))) {
      throw new Error("La reserva ya tiene un comprobante por validar.");
    }
    transaction.update(referencia, {
      estado: ESTADO_RESERVA_DB[status],
      actualizadaEn: serverTimestamp(),
    });
  });
}

export async function cambiarEstadoPago(
  id: string,
  paymentStatus: EstadoPago,
): Promise<void> {
  if (paymentStatus === "PENDING") {
    await actualizarReserva(id, { paymentStatus });
    return;
  }

  const db = obtenerDb();
  const referencia = doc(db, "reservations", id);
  const status =
    paymentStatus === "APPROVED" ? "confirmada" : "rechazada";
  await runTransaction(db, async (transaction) => {
    const reserva = await transaction.get(referencia);
    if (!["pendiente", "confirmada"].includes(reserva.get("estado")) ||
        reserva.get("estadoPago") !== "en_revision") {
      throw new Error("La reserva ya no está pendiente de validación.");
    }
    transaction.update(referencia, {
      estado: status,
      estadoPago: ESTADO_PAGO_DB[paymentStatus],
      actualizadaEn: serverTimestamp(),
    });
  });
}

export async function cambiarEstadoHabitacion(
  id: string,
  status: EstadoHabitacion,
): Promise<void> {
  await updateDoc(doc(obtenerDb(), "rooms", id), {
    estado: ESTADO_HABITACION_DB[status],
    actualizadaEn: serverTimestamp(),
  });
}

export async function crearHabitacion(
  input: DatosHabitacion,
): Promise<string> {
  const db = obtenerDb();
  const numero = input.number.trim();
  await asegurarNumeroHabitacionDisponible(numero);

  const referencia = doc(db, "rooms", idHabitacionPorNumero(numero));
  await runTransaction(db, async (transaction) => {
    const existente = await transaction.get(referencia);
    if (existente.exists()) {
      throw new Error(
        `El número ${numero} ya pertenece a una habitación registrada.`,
      );
    }

    transaction.set(referencia, {
      ...datosHabitacionFirestore(input),
      creadaEn: serverTimestamp(),
      actualizadaEn: serverTimestamp(),
    });
  });

  return referencia.id;
}

export async function actualizarHabitacion(
  id: string,
  input: DatosHabitacion,
): Promise<void> {
  await asegurarNumeroHabitacionDisponible(input.number, id);
  await updateDoc(doc(obtenerDb(), "rooms", id), {
    ...datosHabitacionFirestore(input),
    actualizadaEn: serverTimestamp(),
  });
}

export async function cambiarActividadHabitacion(
  id: string,
  active: boolean,
): Promise<void> {
  await updateDoc(doc(obtenerDb(), "rooms", id), {
    activa: active,
    actualizadaEn: serverTimestamp(),
  });
}
