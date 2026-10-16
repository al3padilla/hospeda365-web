"use client";

import Link from "next/link";
import { useState, type ChangeEvent, type FormEvent } from "react";
import {
  BedDouble,
  CalendarCheck,
  CalendarX2,
  CheckCircle2,
  FileImage,
  Moon,
  Receipt,
  Upload,
  Users,
} from "lucide-react";

import { useAuth } from "../contexto/AuthContext";
import { useHabitaciones } from "../contexto/HabitacionesContext";
import { useReservas } from "../contexto/ReservasContext";
import {
  calcularNoches,
  calcularTotal,
  fechasPorDefecto,
  formatearPrecio,
} from "../datos/reserva";
import DatePicker from "./DatePicker";
import { Spinner } from "./Loader";

type ConfirmacionReservaProps = {
  habitacionId?: string | null;
  checkInInicial?: string | null;
  checkOutInicial?: string | null;
};

export default function ConfirmacionReserva({
  habitacionId,
  checkInInicial,
  checkOutInicial,
}: ConfirmacionReservaProps) {
  const { obtenerPorId, cargando: cargandoHabitaciones } = useHabitaciones();
  const { estaAutenticado } = useAuth();
  const { crearReserva, guardando, error } = useReservas();
  const habitacion = obtenerPorId(habitacionId);
  const [checkIn, setCheckIn] = useState(
    () => checkInInicial || fechasPorDefecto().checkIn,
  );
  const [checkOut, setCheckOut] = useState(
    () => checkOutInicial || fechasPorDefecto().checkOut,
  );
  const [archivo, setArchivo] = useState<File | null>(null);
  const [codigoReserva, setCodigoReserva] = useState<string | null>(null);

  const noches = calcularNoches(checkIn, checkOut);
  const total = habitacion ? calcularTotal(habitacion.pricePerNight, noches) : 0;

  function actualizarFechas(campo: "in" | "out", value: string) {
    if (campo === "in") {
      setCheckIn(value);
      if (checkOut && value && checkOut <= value) setCheckOut("");
    } else {
      setCheckOut(value);
    }
    setCodigoReserva(null);
  }

  function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    setArchivo(event.target.files?.[0] ?? null);
    setCodigoReserva(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!estaAutenticado || !habitacion || !archivo || guardando) return;

    const id = await crearReserva({
      roomId: habitacion.id,
      roomNumber: habitacion.number,
      roomTitle: habitacion.name,
      roomImageUrl: habitacion.imageUrl,
      checkIn,
      checkOut,
      adults: 1,
      children: 0,
      babies: 0,
      nights: noches,
      pricePerNight: habitacion.pricePerNight,
      amount: total,
      proof: archivo.name,
    });
    setCodigoReserva(id);
  }

  if (cargandoHabitaciones) {
    return <div className="py-20 text-center text-mist">Cargando habitación…</div>;
  }

  if (!habitacion) {
    return <div className="py-20 text-center text-mist">Habitación no encontrada.</div>;
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-10 sm:py-14">
      <header className="mb-8 max-w-2xl sm:mb-10">
        <p className="mb-1 font-[family-name:var(--font-script)] text-3xl text-mist">
          Casi listo
        </p>
        <h1 className="mb-3 font-[family-name:var(--font-display)] text-4xl text-sea sm:text-5xl">
          Confirmación de reserva
        </h1>
        <p className="leading-relaxed text-mist">
          Revisa las fechas, el total y la referencia del comprobante.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-5">
        <section className="overflow-hidden rounded-xl border border-sea/10 bg-foam lg:col-span-3">
          <div
            className="h-56 bg-cover bg-center"
            style={{ backgroundImage: `url(${habitacion.imageUrl})` }}
            role="img"
            aria-label={habitacion.name}
          />
          <div className="space-y-6 p-5 sm:p-7">
            <div className="flex items-start gap-3">
              <BedDouble className="mt-1 h-6 w-6 shrink-0 text-coral" aria-hidden />
              <div>
                <h2 className="font-[family-name:var(--font-display)] text-2xl text-sea">
                  Habitación {habitacion.name}
                </h2>
                <p className="mt-1 text-sm leading-relaxed text-mist">
                  {habitacion.description}
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <DatePicker
                label="Check-in"
                value={checkIn}
                onChange={(value) => actualizarFechas("in", value)}
                icon={<CalendarCheck className="h-3.5 w-3.5" aria-hidden />}
              />
              <DatePicker
                label="Check-out"
                value={checkOut}
                onChange={(value) => actualizarFechas("out", value)}
                min={checkIn || undefined}
                icon={<CalendarX2 className="h-3.5 w-3.5" aria-hidden />}
              />
            </div>

            <ul className="grid gap-3 text-sm sm:grid-cols-2">
              <li className="flex items-center gap-2.5 rounded-md border border-sea/10 bg-background px-3 py-2.5 text-sea">
                <Moon className="h-4 w-4 text-coral" aria-hidden />
                {noches} noche{noches === 1 ? "" : "s"}
              </li>
              <li className="flex items-center gap-2.5 rounded-md border border-sea/10 bg-background px-3 py-2.5 text-sea">
                <Users className="h-4 w-4 text-coral" aria-hidden />
                Hasta {habitacion.capacity} personas
              </li>
            </ul>

            <div className="space-y-3 border-t border-sea/10 pt-5">
              <h3 className="flex items-center gap-2 font-semibold text-sea">
                <Receipt className="h-5 w-5 text-coral" aria-hidden />
                Desglose de precio
              </h3>
              <div className="flex justify-between text-sm text-mist">
                <span>
                  {formatearPrecio(habitacion.pricePerNight)} × {noches} noche
                  {noches === 1 ? "" : "s"}
                </span>
                <span>{formatearPrecio(total)}</span>
              </div>
              <div className="flex justify-between border-t border-dashed border-sea/15 pt-2">
                <span className="font-semibold text-sea">Total</span>
                <span className="text-3xl font-semibold text-sea">
                  {formatearPrecio(total)}
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="lg:col-span-2">
          <form
            onSubmit={handleSubmit}
            className="flex h-full flex-col gap-5 rounded-xl border border-sea/10 bg-foam p-5 sm:p-7"
          >
            <div>
              <h2 className="font-[family-name:var(--font-display)] text-2xl text-sea">
                Comprobante de pago
              </h2>
              <p className="mt-1 text-sm text-mist">
                El nombre del archivo se registra con la reserva para su validación.
              </p>
            </div>

            <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-sea/20 px-4 py-10 text-center">
              <input
                type="file"
                accept="image/*,.pdf"
                className="sr-only"
                disabled={guardando}
                onChange={onFileChange}
              />
              {archivo ? (
                <>
                  <FileImage className="h-10 w-10 text-sea" aria-hidden />
                  <span className="break-all text-sm font-medium text-sea">
                    {archivo.name}
                  </span>
                </>
              ) : (
                <>
                  <Upload className="h-10 w-10 text-mist" aria-hidden />
                  <span className="text-sm font-medium text-sea">
                    Seleccionar comprobante
                  </span>
                </>
              )}
            </label>

            <button
              type="submit"
              disabled={!estaAutenticado || !archivo || guardando}
              className="mt-auto inline-flex w-full items-center justify-center gap-2 rounded-md bg-coral py-3 font-semibold text-white disabled:opacity-45"
            >
              {guardando ? (
                <>
                  <Spinner className="h-4 w-4 text-white" />
                  Registrando…
                </>
              ) : (
                "Confirmar reserva"
              )}
            </button>

            {!estaAutenticado ? (
              <p className="rounded-md border border-sea/10 bg-background px-3 py-3 text-sm text-sea">
                <Link href="/login" className="font-semibold text-coral">
                  Inicia sesión
                </Link>{" "}
                para registrar la reserva.
              </p>
            ) : null}

            {error ? (
              <p className="rounded-md border border-red-200 bg-red-50 px-3 py-3 text-sm text-red-700">
                {error}
              </p>
            ) : null}

            {codigoReserva ? (
              <p className="flex gap-2 rounded-md border border-sea/10 bg-background px-3 py-3 text-sm text-sea">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-coral" aria-hidden />
                <span>
                  Reserva registrada: <strong>{codigoReserva}</strong>.
                </span>
              </p>
            ) : null}
          </form>
        </section>
      </div>
    </div>
  );
}
