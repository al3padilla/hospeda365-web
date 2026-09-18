"use client";

import { useState, type ChangeEvent, type DragEvent, type FormEvent } from "react";
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
import {
  armarResumen,
  calcularNoches,
  calcularTotal,
  formatearPrecio,
  obtenerHabitacionPorId,
} from "../datos/reserva";
import DatePicker from "./DatePicker";

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
  const habitacion = obtenerHabitacionPorId(habitacionId);
  const inicial = armarResumen(habitacionId, checkInInicial, checkOutInicial);

  const [checkIn, setCheckIn] = useState(inicial.checkIn);
  const [checkOut, setCheckOut] = useState(inicial.checkOut);
  const [archivo, setArchivo] = useState<File | null>(null);
  const [confirmado, setConfirmado] = useState(false);
  const [arrastrando, setArrastrando] = useState(false);

  const noches = calcularNoches(checkIn, checkOut);
  const total = calcularTotal(habitacion.pricePerNight, noches);

  function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setArchivo(file);
    setConfirmado(false);
  }

  function onDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setArrastrando(false);
    const file = event.dataTransfer.files?.[0] ?? null;
    if (file) {
      setArchivo(file);
      setConfirmado(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!archivo) return;
    console.log({
      habitacion: habitacion.id,
      checkIn,
      checkOut,
      noches,
      total,
      comprobante: archivo.name,
    });
    setConfirmado(true);
  }

  return (
    <div className="container mx-auto px-4 py-10 sm:py-14 max-w-6xl">
      <header className="mb-8 sm:mb-10 max-w-2xl">
        <p className="font-[family-name:var(--font-script)] text-3xl text-mist mb-1">
          Casi listo
        </p>
        <h1 className="font-[family-name:var(--font-display)] text-4xl sm:text-5xl text-sea mb-3">
          Confirmación de reserva
        </h1>
        <p className="text-mist leading-relaxed">
          Revisa el resumen de tu estancia, verifica el total y sube tu
          comprobante de pago para confirmar.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-5">
        {/* Resumen */}
        <section className="lg:col-span-3 bg-foam border border-sea/10 rounded-xl">
          <div className="overflow-hidden rounded-t-xl">
            <div
              className="h-48 sm:h-56 bg-cover bg-center"
              style={{ backgroundImage: `url(${habitacion.imageUrl})` }}
              role="img"
              aria-label={habitacion.name}
            />
          </div>
          <div className="p-5 sm:p-7 space-y-6">
            <div className="flex items-start gap-3">
              <BedDouble className="h-6 w-6 text-coral shrink-0 mt-1" aria-hidden />
              <div>
                <h2 className="font-[family-name:var(--font-display)] text-2xl text-sea">
                  Habitación {habitacion.name}
                </h2>
                <p className="text-sm text-mist mt-1 leading-relaxed">
                  {habitacion.description}
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <DatePicker
                label="Check-in"
                value={checkIn}
                onChange={(value) => {
                  setCheckIn(value);
                  if (checkOut && value && checkOut <= value) {
                    setCheckOut("");
                  }
                  setConfirmado(false);
                }}
                icon={<CalendarCheck className="h-3.5 w-3.5" aria-hidden />}
                placeholder="Fecha de llegada"
              />

              <DatePicker
                label="Check-out"
                value={checkOut}
                onChange={(value) => {
                  setCheckOut(value);
                  setConfirmado(false);
                }}
                min={checkIn || undefined}
                icon={<CalendarX2 className="h-3.5 w-3.5" aria-hidden />}
                placeholder="Fecha de salida"
              />
            </div>

            <ul className="grid gap-3 sm:grid-cols-2 text-sm">
              <li className="flex items-center gap-2.5 text-sea bg-background rounded-md px-3 py-2.5 border border-sea/10">
                <Moon className="h-4 w-4 text-coral shrink-0" aria-hidden />
                <span>
                  {noches} noche{noches === 1 ? "" : "s"}
                </span>
              </li>
              <li className="flex items-center gap-2.5 text-sea bg-background rounded-md px-3 py-2.5 border border-sea/10">
                <Users className="h-4 w-4 text-coral shrink-0" aria-hidden />
                <span>
                  Hasta {habitacion.capacity} persona
                  {habitacion.capacity === 1 ? "" : "s"}
                </span>
              </li>
            </ul>

            <div className="border-t border-sea/10 pt-5 space-y-3">
              <h3 className="flex items-center gap-2 font-semibold text-sea tracking-wide">
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
              <div className="flex justify-between items-baseline pt-2 border-t border-dashed border-sea/15">
                <span className="font-semibold text-sea">Total</span>
                <span className="font-[family-name:var(--font-display)] text-3xl text-sea">
                  {formatearPrecio(total)}
                </span>
              </div>
              <p className="text-xs text-mist">
                El total se recalcula automáticamente al cambiar las fechas.
              </p>
            </div>
          </div>
        </section>

        {/* Pago / comprobante */}
        <section className="lg:col-span-2">
          <form
            onSubmit={handleSubmit}
            className="bg-foam border border-sea/10 rounded-xl p-5 sm:p-7 h-full flex flex-col gap-5"
          >
            <div>
              <h2 className="font-[family-name:var(--font-display)] text-2xl text-sea mb-1">
                Comprobante de pago
              </h2>
              <p className="text-sm text-mist leading-relaxed">
                Sube una captura o PDF de tu transferencia (simulación). Luego
                confirma la reserva.
              </p>
            </div>

            <label
              onDragOver={(e) => {
                e.preventDefault();
                setArrastrando(true);
              }}
              onDragLeave={() => setArrastrando(false)}
              onDrop={onDrop}
              className={`flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-4 py-10 cursor-pointer transition text-center ${
                arrastrando
                  ? "border-coral bg-coral/5"
                  : archivo
                    ? "border-sea/30 bg-background"
                    : "border-sea/20 hover:border-coral/50 hover:bg-background"
              }`}
            >
              <input
                type="file"
                accept="image/*,.pdf"
                className="sr-only"
                onChange={onFileChange}
              />
              {archivo ? (
                <>
                  <FileImage className="h-10 w-10 text-sea" aria-hidden />
                  <span className="text-sm font-medium text-sea break-all px-2">
                    {archivo.name}
                  </span>
                  <span className="text-xs text-mist">
                    Haz clic para cambiar el archivo
                  </span>
                </>
              ) : (
                <>
                  <Upload className="h-10 w-10 text-mist" aria-hidden />
                  <span className="text-sm font-medium text-sea">
                    Arrastra tu comprobante aquí
                  </span>
                  <span className="text-xs text-mist">
                    o haz clic para seleccionar (JPG, PNG o PDF)
                  </span>
                </>
              )}
            </label>

            <button
              type="submit"
              disabled={!archivo}
              className="mt-auto w-full bg-coral text-white py-3 rounded-md font-semibold tracking-wide hover:bg-coral-hover transition disabled:opacity-45 disabled:cursor-not-allowed"
            >
              Confirmar reserva
            </button>

            {confirmado ? (
              <p className="flex items-start gap-2 text-sm text-sea bg-background border border-sea/10 rounded-md px-3 py-3">
                <CheckCircle2
                  className="h-5 w-5 text-coral shrink-0 mt-0.5"
                  aria-hidden
                />
                <span>
                  Reserva simulada con éxito. Tu comprobante{" "}
                  <strong>{archivo?.name}</strong> quedó registrado de forma
                  local (sin envío a servidor).
                </span>
              </p>
            ) : null}
          </form>
        </section>
      </div>
    </div>
  );
}
