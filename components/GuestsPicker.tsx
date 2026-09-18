"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Baby, Minus, Plus, User, Users } from "lucide-react";

export type Huespedes = {
  adultos: number;
  ninos: number;
  bebes: number;
};

type GuestsPickerProps = {
  value: Huespedes;
  onChange: (value: Huespedes) => void;
};

function totalHuespedes(h: Huespedes): number {
  return h.adultos + h.ninos + h.bebes;
}

/** Total que cuenta para capacidad de habitación (adultos + niños). */
export function totalParaCapacidad(h: Huespedes): number {
  return Math.max(1, h.adultos + h.ninos);
}

function resumen(h: Huespedes): string {
  const partes: string[] = [];
  partes.push(`${h.adultos} adulto${h.adultos === 1 ? "" : "s"}`);
  if (h.ninos > 0) partes.push(`${h.ninos} niño${h.ninos === 1 ? "" : "s"}`);
  if (h.bebes > 0) partes.push(`${h.bebes} bebé${h.bebes === 1 ? "" : "s"}`);
  return partes.join(", ");
}

type FilaProps = {
  label: string;
  hint: string;
  icon: ReactNode;
  value: number;
  min: number;
  max: number;
  onChange: (n: number) => void;
};

function FilaContador({
  label,
  hint,
  icon,
  value,
  min,
  max,
  onChange,
}: FilaProps) {
  return (
    <div className="flex items-center justify-between gap-3 py-2">
      <div className="flex items-start gap-2.5 min-w-0">
        <span className="mt-0.5 text-coral shrink-0">{icon}</span>
        <div>
          <p className="text-sm font-semibold text-sea">{label}</p>
          <p className="text-xs text-mist">{hint}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          aria-label={`Menos ${label}`}
          disabled={value <= min}
          onClick={() => onChange(Math.max(min, value - 1))}
          className="flex h-8 w-8 items-center justify-center rounded-md border border-sea/20 text-sea transition hover:bg-background disabled:opacity-35"
        >
          <Minus className="h-4 w-4" />
        </button>
        <span className="w-6 text-center text-sm font-semibold text-sea">
          {value}
        </span>
        <button
          type="button"
          aria-label={`Más ${label}`}
          disabled={value >= max}
          onClick={() => onChange(Math.min(max, value + 1))}
          className="flex h-8 w-8 items-center justify-center rounded-md border border-sea/20 text-sea transition hover:bg-background disabled:opacity-35"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export default function GuestsPicker({ value, onChange }: GuestsPickerProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function onDocDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onEsc(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onDocDown);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocDown);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative z-40 flex w-full flex-col gap-1.5 text-left sm:w-44">
      <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-mist">
        <Users className="h-3.5 w-3.5" aria-hidden />
        Personas
      </span>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-2 rounded-md border border-sea/15 bg-white px-3 py-2.5 text-left text-sm text-sea transition hover:border-sea/30 focus:outline-none focus:ring-2 focus:ring-coral/50"
      >
        <span className="truncate">{resumen(value)}</span>
        <span className="shrink-0 rounded-full bg-sea/10 px-2 py-0.5 text-xs font-semibold text-sea">
          {totalHuespedes(value)}
        </span>
      </button>

      {open ? (
        <div
          role="dialog"
          aria-label="Seleccionar huéspedes"
          className="absolute left-0 top-full z-50 mt-2 w-[min(100vw-2rem,300px)] rounded-xl border border-sea/15 bg-white p-3"
          style={{ boxShadow: "0 12px 32px rgba(12, 59, 102, 0.14)" }}
        >
          <FilaContador
            label="Adultos"
            hint="Desde 13 años"
            icon={<User className="h-4 w-4" />}
            value={value.adultos}
            min={1}
            max={10}
            onChange={(adultos) => onChange({ ...value, adultos })}
          />
          <FilaContador
            label="Niños"
            hint="2 a 12 años"
            icon={<Users className="h-4 w-4" />}
            value={value.ninos}
            min={0}
            max={8}
            onChange={(ninos) => onChange({ ...value, ninos })}
          />
          <FilaContador
            label="Bebés"
            hint="Menores de 2 años"
            icon={<Baby className="h-4 w-4" />}
            value={value.bebes}
            min={0}
            max={4}
            onChange={(bebes) => onChange({ ...value, bebes })}
          />
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="mt-2 w-full rounded-md bg-coral py-2 text-sm font-semibold text-white transition hover:bg-coral-hover"
          >
            Listo
          </button>
        </div>
      ) : null}
    </div>
  );
}
