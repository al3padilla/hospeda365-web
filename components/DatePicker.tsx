"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import {
  DIAS_SEMANA,
  MESES,
  formatFechaCorta,
  parseIso,
  sameDay,
  startOfDay,
  toIsoLocal,
} from "../datos/fechas";

type DatePickerProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  min?: string;
  icon?: ReactNode;
  placeholder?: string;
};

export default function DatePicker({
  label,
  value,
  onChange,
  min,
  icon,
  placeholder = "Selecciona una fecha",
}: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const selected = parseIso(value);
  const minDate = parseIso(min ?? "");
  const [view, setView] = useState<Date>(() => {
    return parseIso(value) ?? parseIso(min ?? "") ?? new Date(2026, 8, 1);
  });
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setReady(true);
    setView(parseIso(value) ?? parseIso(min ?? "") ?? new Date());
    // Solo al montar
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const s = parseIso(value);
    if (s) setView(s);
  }, [value]);

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

  const year = view.getFullYear();
  const month = view.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = ready ? startOfDay(new Date()) : null;

  const cells: Array<Date | null> = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push(new Date(year, month, day));
  }

  function isDisabled(date: Date): boolean {
    if (!minDate) return false;
    return startOfDay(date) < startOfDay(minDate);
  }

  function pick(date: Date) {
    if (isDisabled(date)) return;
    onChange(toIsoLocal(date));
    setOpen(false);
  }

  const display = selected ? formatFechaCorta(value) : placeholder;

  return (
    <div ref={rootRef} className="relative z-40 flex flex-col gap-1.5 text-left">
      <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-mist">
        {icon}
        {label}
      </span>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-2 rounded-md border border-sea/15 bg-white px-3 py-2.5 text-left text-sea transition hover:border-sea/30 focus:outline-none focus:ring-2 focus:ring-coral/50"
      >
        <span className={selected ? "text-sea" : "text-mist"}>{display}</span>
        <CalendarDays className="h-4 w-4 shrink-0 text-coral" aria-hidden />
      </button>

      {open ? (
        <div
          role="dialog"
          aria-label={`Calendario ${label}`}
          className="mt-2 w-full min-w-[260px] rounded-xl border border-sea/15 bg-white p-3"
          style={{ boxShadow: "0 12px 32px rgba(12, 59, 102, 0.14)" }}
        >
          <div className="mb-3 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => setView(new Date(year, month - 1, 1))}
              aria-label="Mes anterior"
              className="rounded-md p-1.5 text-sea transition hover:bg-[#f8fafc]"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <p className="font-[family-name:var(--font-display)] text-base text-sea">
              {MESES[month]} {year}
            </p>
            <button
              type="button"
              onClick={() => setView(new Date(year, month + 1, 1))}
              aria-label="Mes siguiente"
              className="rounded-md p-1.5 text-sea transition hover:bg-[#f8fafc]"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="mb-1 grid grid-cols-7 gap-1">
            {DIAS_SEMANA.map((d) => (
              <span
                key={d}
                className="py-1 text-center text-[10px] font-semibold uppercase tracking-wide text-mist"
              >
                {d}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {cells.map((date, i) => {
              if (!date) return <span key={`e-${i}`} className="h-9" />;

              const disabled = isDisabled(date);
              const isSelected = selected ? sameDay(date, selected) : false;
              const isToday = today ? sameDay(date, today) : false;

              return (
                <button
                  key={toIsoLocal(date)}
                  type="button"
                  disabled={disabled}
                  onClick={() => pick(date)}
                  className={`h-9 rounded-md text-sm transition ${
                    isSelected
                      ? "bg-coral font-semibold text-white"
                      : isToday
                        ? "bg-sea/10 font-semibold text-sea"
                        : "text-sea hover:bg-[#f8fafc]"
                  } ${disabled ? "cursor-not-allowed opacity-30 hover:bg-transparent" : ""}`}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>

          <div className="mt-3 flex items-center justify-between gap-2 border-t border-sea/10 pt-2">
            <button
              type="button"
              onClick={() => {
                onChange("");
                setOpen(false);
              }}
              className="text-xs font-medium text-mist transition hover:text-sea"
            >
              Borrar
            </button>
            <button
              type="button"
              onClick={() => {
                if (today && !isDisabled(today)) {
                  onChange(toIsoLocal(today));
                  setView(today);
                  setOpen(false);
                }
              }}
              className="text-xs font-semibold text-coral transition hover:text-coral-hover"
            >
              Hoy
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
