export type EstadoHabitacion =
  | "AVAILABLE"
  | "OCCUPIED"
  | "CLEANING"
  | "MAINTENANCE";

export type EstadoReserva =
  | "PENDING"
  | "CONFIRMED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED"
  | "REJECTED";

export type EstadoPago = "PENDING" | "APPROVED" | "REJECTED";

export type Habitacion = {
  id: string;
  number: string;
  floor: number;
  name: string;
  description: string;
  pricePerNight: number;
  capacity: number;
  imageUrl: string;
  highlights: string[];
  status: EstadoHabitacion;
  active: boolean;
};

export type Reserva = {
  id: string;
  userId: string | null;
  guestName: string;
  roomId: string;
  roomTitle: string;
  roomImageUrl: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  babies: number;
  nights: number;
  pricePerNight: number;
  amount: number;
  status: EstadoReserva;
  paymentStatus: EstadoPago;
  proof: string;
  proofUrl: string | null;
};

export type NuevaReserva = Omit<
  Reserva,
  "id" | "status" | "paymentStatus" | "proofUrl"
> & {
  roomNumber?: string;
  proofUrl?: string | null;
};

export type HabitacionAdmin = Pick<
  Habitacion,
  "id" | "number" | "name" | "pricePerNight" | "status"
> & {
  title: string;
  price: number;
};

export type ReservaAdmin = Reserva;
