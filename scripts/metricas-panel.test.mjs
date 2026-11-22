import assert from "node:assert/strict";
import test from "node:test";
import { resumirPanel } from "../datos/metricasPanel.ts";

test("las métricas reflejan la revisión de comprobantes y la ocupación", () => {
  const reserva = {
    checkIn: "2026-11-25",
    amount: 80,
    status: "PENDING",
    paymentStatus: "PENDING",
    proofUrl: null,
  };
  const habitacion = { status: "AVAILABLE" };
  const hoy = new Date(2026, 10, 21);
  const resumir = (r, h = habitacion) => resumirPanel([r], [h], hoy);

  assert.equal(resumir(reserva).reservasPendientes, 1);
  assert.equal(resumir(reserva).comprobantesPorValidar, 0);

  const conComprobante = { ...reserva, proofUrl: "https://example.test/comprobante.pdf" };
  assert.equal(resumir(conComprobante).comprobantesPorValidar, 1);
  const generado = { ...reserva, status: "CONFIRMED", proofGenerated: true };
  assert.equal(resumir(generado).comprobantesPorValidar, 1);
  assert.equal(resumir(generado).pagosPorEstado.find((p) => p.etiqueta === "En revisión")?.cantidad, 1);
  assert.equal(resumir({ ...reserva, status: "CONFIRMED", paymentUnsubmitted: true })
    .pagosPorEstado.find((p) => p.etiqueta === "Pendientes de pagar")?.cantidad, 1);

  const aprobado = resumir({ ...conComprobante, status: "CONFIRMED", paymentStatus: "APPROVED" });
  assert.equal(aprobado.comprobantesPorValidar, 0);
  assert.equal(aprobado.reservasPendientes, 0);
  assert.equal(aprobado.ingresosConfirmados, reserva.amount);

  const rechazado = resumir({ ...conComprobante, status: "REJECTED", paymentStatus: "REJECTED" });
  assert.equal(rechazado.comprobantesPorValidar, 0);
  assert.equal(rechazado.reservasPendientes, 0);
  assert.equal(rechazado.ingresosConfirmados, 0);
  assert.equal(resumir({ ...conComprobante, status: "CANCELLED" }).porCobrar, 0);
  assert.equal(resumir({ ...conComprobante, status: "CANCELLED" }).comprobantesPorValidar, 0);
  assert.equal(resumir({ ...reserva, status: "CANCELLED" })
    .reservasPorEstado.find((r) => r.etiqueta === "Canceladas")?.cantidad, 1);

  assert.equal(resumir(reserva, { status: "OCCUPIED" }).ocupacionPorcentaje, 100);
  const limpieza = resumir(reserva, { status: "CLEANING" });
  assert.equal(limpieza.ocupacionPorcentaje, 0);
  assert.deepEqual(limpieza.estadoHabitaciones, [{ estado: "limpieza", cantidad: 1 }]);
});
