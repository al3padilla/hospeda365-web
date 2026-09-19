"use client";

import {
  useState,
  type ChangeEvent,
  type DragEvent,
  type FormEvent,
} from "react";
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
import { DELAYS } from "../datos/carga";
import { useDelayedAction } from "../hooks/useDelayedAction";
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
  const habitacion = obtenerHabitacionPorId(habitacionId);
  const inicial = armarResumen(habitacionId, checkInInicial, checkOutInicial);
  const { runAfter } = useDelayedAction();

  const [checkIn, setCheckIn] = useState(inicial.checkIn);
  const [checkOut, setCheckOut] = useState(inicial.checkOut);
  const [archivo, setArchivo] = useState<File | null>(null);
  const [confirmado, setConfirmado] = useState(false);
  const [arrastrando, setArrastrando] = useState(false);
  const [subiendo, setSubiendo] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const noches = calcularNoches(checkIn, checkOut);
  const total = calcularTotal(habitacion.pricePerNight, noches);
  const ocupado = subiendo || enviando;

  function actualizarFechas(campo: "in" | "out", value: string) {
    if (campo === "in") {
      setCheckIn(value);
      if (checkOut && value && checkOut <= value) setCheckOut("");
    } else {
      setCheckOut(value);
    }
    setConfirmado(false);
  }

  function procesarArchivo(file: File | null) {
    if (!file || ocupado) return;
    setSubiendo(true);
    setConfirmado(false);
    setArchivo(null);

    runAfter(DELAYS.subida, () => {
      setArchivo(file);
      setSubiendo(false);
    });
  }

  function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    procesarArchivo(event.target.files?.[0] ?? null);
    event.target.value = "";
  }

  function onDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setArrastrando(false);
    procesarArchivo(event.dataTransfer.files?.[0] ?? null);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!archivo || ocupado) return;

    setEnviando(true);
    setConfirmado(false);

    runAfter(DELAYS.confirmar, () => {
      console.log({
        habitacion: habitacion.id,
        checkIn,
        checkOut,
        noches,
        total,
        comprobante: archivo.name,
      });
      setEnviando(false);
      setConfirmado(true);
    });
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
          Revisa el resumen de tu estancia, verifica el total y sube tu
          comprobante de pago para confirmar.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-5">
        <section className="rounded-xl border border-sea/10 bg-foam lg:col-span-3">
          <div className="overflow-hidden rounded-t-xl">
            <div
              className="h-48 bg-cover bg-center sm:h-56"
              style={{ backgroundImage: `url(${habitacion.imageUrl})` }}
              role="img"
              aria-label={habitacion.name}
            />
          </div>
          <div className="space-y-6 p-5 sm:p-7">
            <div className="flex items-start gap-3">
              <BedDouble
                className="mt-1 h-6 w-6 shrink-0 text-coral"
                aria-hidden
              />
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
                placeholder="Fecha de llegada"
              />
              <DatePicker
                label="Check-out"
                value={checkOut}
                onChange={(value) => actualizarFechas("out", value)}
                min={checkIn || undefined}
                icon={<CalendarX2 className="h-3.5 w-3.5" aria-hidden />}
                placeholder="Fecha de salida"
              />
            </div>

            <ul className="grid gap-3 text-sm sm:grid-cols-2">
              <li className="flex items-center gap-2.5 rounded-md border border-sea/10 bg-background px-3 py-2.5 text-sea">
                <Moon className="h-4 w-4 shrink-0 text-coral" aria-hidden />
                <span>
                  {noches} noche{noches === 1 ? "" : "s"}
                </span>
              </li>
              <li className="flex items-center gap-2.5 rounded-md border border-sea/10 bg-background px-3 py-2.5 text-sea">
                <Users className="h-4 w-4 shrink-0 text-coral" aria-hidden />
                <span>
                  Hasta {habitacion.capacity} persona
                  {habitacion.capacity === 1 ? "" : "s"}
                </span>
              </li>
            </ul>

            <div className="space-y-3 border-t border-sea/10 pt-5">
              <h3 className="flex items-center gap-2 font-semibold tracking-wide text-sea">
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
              <div className="flex items-baseline justify-between border-t border-dashed border-sea/15 pt-2">
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

        <section className="lg:col-span-2">
          <form
            onSubmit={handleSubmit}
            className="flex h-full flex-col gap-5 rounded-xl border border-sea/10 bg-foam p-5 sm:p-7"
          >
            <div>
              <h2 className="mb-1 font-[family-name:var(--font-display)] text-2xl text-sea">
                Comprobante de pago
              </h2>
              <p className="text-sm leading-relaxed text-mist">
                Sube una captura o PDF de tu transferencia (simulación). Luego
                confirma la reserva.
              </p>
            </div>

            <label
              onDragOver={(e) => {
                e.preventDefault();
                if (!ocupado) setArrastrando(true);
              }}
              onDragLeave={() => setArrastrando(false)}
              onDrop={onDrop}
              className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-4 py-10 text-center transition ${
                ocupado ? "pointer-events-none opacity-70" : ""
              } ${
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
                disabled={ocupado}
                onChange={onFileChange}
              />
              {subiendo ? (
                <>
                  <Spinner className="h-10 w-10" label="Procesando archivo" />
                  <span className="text-sm font-medium text-sea">
                    Procesando comprobante…
                  </span>
                  <span className="text-xs text-mist">
                    Validando archivo, un momento
                  </span>
                </>
              ) : archivo ? (
                <>
                  <FileImage className="h-10 w-10 text-sea" aria-hidden />
                  <span className="break-all px-2 text-sm font-medium text-sea">
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
              disabled={!archivo || ocupado}
              className="mt-auto inline-flex w-full items-center justify-center gap-2 rounded-md bg-coral py-3 font-semibold tracking-wide text-white transition hover:bg-coral-hover disabled:cursor-not-allowed disabled:opacity-45"
            >
              {enviando ? (
                <>
                  <Spinner className="h-4 w-4 text-white" />
                  Confirmando reserva…
                </>
              ) : (
                "Confirmar reserva"
              )}
            </button>

            {confirmado ? (
              <p className="flex items-start gap-2 rounded-md border border-sea/10 bg-background px-3 py-3 text-sm text-sea">
                <CheckCircle2
                  className="mt-0.5 h-5 w-5 shrink-0 text-coral"
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
