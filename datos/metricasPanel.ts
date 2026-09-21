/**
 * Métricas del dashboard, calculadas EN VIVO desde los datos del panel de
 * gestión (reservas y habitaciones de `adminService`).
 *
 * No hay una segunda fuente de datos: si recepción aprueba un comprobante o
 * cambia una habitación a "Ocupada", el dashboard lo refleja en el acto.
 * Cuando el panel pase a Firestore, estas funciones siguen igual: reciben
 * las mismas listas, vengan de donde vengan.
 *
 * Son funciones puras (mismos datos → mismo resultado), así que se prueban
 * sin montar ningún componente.
 */

import type { HabitacionAdmin, ReservaAdmin } from "../servicios/adminService";
import type { ConteoEstado, EstadoHabitacion, ResumenMes } from "./metricas";

const MESES_CORTOS = [
  "Ene", "Feb", "Mar", "Abr", "May", "Jun",
  "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
] as const;

export type ResumenPanel = {
  ocupacionPorcentaje: number;
  habitacionesTotales: number;
  habitacionesOcupadas: number;
  /** Suma de reservas con comprobante aprobado. */
  ingresosConfirmados: number;
  /** Reservas con comprobante en revisión que no fueron rechazadas. */
  porCobrar: number;
  reservasPendientes: number;
  comprobantesPorValidar: number;
  ingresosPorMes: ResumenMes[];
  estadoHabitaciones: ConteoEstado[];
  reservasPorEstado: { etiqueta: string; cantidad: number }[];
};

/** "2026-09-25" → "2026-09" */
function periodoDe(fechaIso: string): string {
  return fechaIso.slice(0, 7);
}

/** "2026-09" → "Sep" */
function etiquetaDe(periodo: string): string {
  const mes = Number(periodo.slice(5, 7));
  return MESES_CORTOS[mes - 1] ?? periodo;
}

/** Mes siguiente: "2026-12" → "2027-01" */
function siguientePeriodo(periodo: string): string {
  let anio = Number(periodo.slice(0, 4));
  let mes = Number(periodo.slice(5, 7)) + 1;
  if (mes > 12) {
    mes = 1;
    anio += 1;
  }
  return `${anio}-${String(mes).padStart(2, "0")}`;
}

/** Periodo del mes en curso, en hora local: "2026-09" */
export function periodoActual(hoy: Date = new Date()): string {
  return `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, "0")}`;
}

/**
 * Ingresos confirmados agrupados por mes de check-in.
 *
 * Se rellenan los meses vacíos entre el primero y el último con datos, para
 * que la gráfica no se "salte" meses y haga creer que hubo continuidad.
 * El mes en curso siempre aparece, aunque todavía no tenga ingresos.
 */
export function ingresosPorMes(
  reservas: ReservaAdmin[],
  hoy: Date = new Date(),
): ResumenMes[] {
  const aprobadas = reservas.filter((r) => r.paymentStatus === "APPROVED");
  const actual = periodoActual(hoy);

  const porPeriodo = new Map<string, { ingresos: number; reservas: number }>();
  for (const r of aprobadas) {
    const p = periodoDe(r.checkIn);
    const previo = porPeriodo.get(p) ?? { ingresos: 0, reservas: 0 };
    porPeriodo.set(p, {
      ingresos: previo.ingresos + r.amount,
      reservas: previo.reservas + 1,
    });
  }

  const periodos = [...porPeriodo.keys(), actual].sort();
  const desde = periodos[0];
  const hasta = periodos[periodos.length - 1];

  const resultado: ResumenMes[] = [];
  // Tope de seguridad: nunca más de 24 meses, aunque haya una fecha rara.
  for (let p = desde, n = 0; p <= hasta && n < 24; p = siguientePeriodo(p), n++) {
    const datos = porPeriodo.get(p) ?? { ingresos: 0, reservas: 0 };
    resultado.push({ periodo: p, etiqueta: etiquetaDe(p), ...datos });
  }

  return resultado;
}

/** Traduce los estados del panel a los del dashboard. */
const MAPA_ESTADO: Record<HabitacionAdmin["status"], EstadoHabitacion> = {
  AVAILABLE: "disponible",
  OCCUPIED: "ocupada",
  CLEANING: "limpieza",
};

export function resumirPanel(
  reservas: ReservaAdmin[],
  habitaciones: HabitacionAdmin[],
  hoy: Date = new Date(),
): ResumenPanel {
  const total = habitaciones.length;
  const ocupadas = habitaciones.filter((h) => h.status === "OCCUPIED").length;

  const conteo = new Map<EstadoHabitacion, number>();
  for (const h of habitaciones) {
    const estado = MAPA_ESTADO[h.status];
    conteo.set(estado, (conteo.get(estado) ?? 0) + 1);
  }

  const suma = (lista: ReservaAdmin[]) =>
    lista.reduce((acc, r) => acc + r.amount, 0);

  return {
    ocupacionPorcentaje: total === 0 ? 0 : (ocupadas / total) * 100,
    habitacionesTotales: total,
    habitacionesOcupadas: ocupadas,
    ingresosConfirmados: suma(
      reservas.filter((r) => r.paymentStatus === "APPROVED"),
    ),
    porCobrar: suma(
      reservas.filter(
        (r) => r.paymentStatus === "PENDING" && r.status !== "REJECTED",
      ),
    ),
    reservasPendientes: reservas.filter((r) => r.status === "PENDING").length,
    comprobantesPorValidar: reservas.filter((r) => r.paymentStatus === "PENDING")
      .length,
    ingresosPorMes: ingresosPorMes(reservas, hoy),
    estadoHabitaciones: [...conteo].map(([estado, cantidad]) => ({
      estado,
      cantidad,
    })),
    reservasPorEstado: [
      {
        etiqueta: "Confirmadas",
        cantidad: reservas.filter((r) => r.status === "CONFIRMED").length,
      },
      {
        etiqueta: "Pendientes",
        cantidad: reservas.filter((r) => r.status === "PENDING").length,
      },
      {
        etiqueta: "Rechazadas",
        cantidad: reservas.filter((r) => r.status === "REJECTED").length,
      },
    ],
  };
}
