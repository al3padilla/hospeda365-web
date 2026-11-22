"use client";

import { useRef, useState, type FormEvent } from "react";
import { sendEmailVerification } from "firebase/auth";
import { CreditCard } from "lucide-react";
import { obtenerAuth } from "../servicios/firebase";
import { registrarComprobanteSimulado } from "../servicios/hotelFirestore";

type Comprobante = { nombre: string; pdf: string; enviado: boolean; correoVerificado: boolean };

export default function PagoSimulado({ reservaId, correoCuenta, enRevision }: {
  reservaId: string;
  correoCuenta: string;
  enRevision: boolean;
}) {
  const [correo, setCorreo] = useState(correoCuenta);
  const [comprobante, setComprobante] = useState<Comprobante | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const [error, setError] = useState("");
  const [aviso, setAviso] = useState("");
  const [terminacion, setTerminacion] = useState("");
  const grupos = useRef<(HTMLInputElement | null)[]>([]);

  async function registrar() {
    try {
      await registrarComprobanteSimulado(reservaId);
    } catch (causa) {
      if ((causa as { code?: string })?.code === "permission-denied") {
        throw new Error("Firebase rechazó el registro. Deben publicarse las reglas de Firestore del proyecto.");
      }
      throw new Error("No se pudo enviar el comprobante al panel. Intenta de nuevo.");
    }
    setAviso("Comprobante enviado al panel para revisión.");
  }

  async function solicitarComprobante(enviar: boolean): Promise<Comprobante> {
    const token = await obtenerAuth().currentUser?.getIdToken();
    if (!token) throw new Error("Inicia sesión para continuar.");
    const respuesta = await fetch("/api/pago-simulado", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ reservaId, correo, enviar }),
    });
    const resultado = await respuesta.json();
    if (!respuesta.ok) throw new Error(resultado.error);
    return resultado;
  }

  async function generar() {
    setOcupado(true);
    setError("");
    try {
      if (!enRevision) {
        const resultado = await solicitarComprobante(false);
        setComprobante(resultado);
        await registrar();
      }
      setComprobante(await solicitarComprobante(true));
    } catch (causa) {
      setError(causa instanceof Error ? causa.message : "No se pudo generar el comprobante.");
    } finally {
      setOcupado(false);
    }
  }

  async function reintentarRegistro() {
    if (!comprobante) return;
    setError("");
    setOcupado(true);
    try {
      await registrar();
      setComprobante(await solicitarComprobante(true));
    } catch (causa) {
      setError(causa instanceof Error ? causa.message : "No se pudo completar el envío.");
    } finally {
      setOcupado(false);
    }
  }

  async function verificarCorreo() {
    const usuario = obtenerAuth().currentUser;
    if (!usuario) return;
    setOcupado(true);
    setError("");
    try {
      await sendEmailVerification(usuario);
      setAviso("Abre el enlace de verificación en tu correo y vuelve a intentar el envío.");
    } catch {
      setError("No se pudo enviar el enlace de verificación.");
    } finally {
      setOcupado(false);
    }
  }

  return (
    <section className="space-y-4 rounded-xl border border-sea/15 bg-background p-4">
      <h3 className="flex items-center gap-2 font-semibold text-sea">
        <CreditCard className="size-4" aria-hidden="true" /> Pago simulado
      </h3>
      {!enRevision && <p className="text-sm text-mist">Ingresa 16 dígitos ficticios. Simulación universitaria sin cargo.</p>}
      {comprobante ? (
        <div className="space-y-2 text-sm">
          {terminacion && <p>Tarjeta ficticia terminada en {terminacion}</p>}
          <p role="status">
            {comprobante.enviado ? `Comprobante enviado a ${correo}.` : comprobante.correoVerificado
              ? "El envío por correo no está disponible. Puedes descargar el comprobante."
              : "El correo de tu cuenta está pendiente de verificación. Puedes descargar el comprobante."}
          </p>
          <a className="font-semibold text-sea underline" href={`data:application/pdf;base64,${comprobante.pdf}`} download={comprobante.nombre}>
            Descargar comprobante PDF
          </a>
          {!comprobante.enviado && (
            <div className="flex flex-wrap gap-3">
              {!comprobante.correoVerificado && !aviso && (
                <button type="button" disabled={ocupado} className="font-semibold text-sea underline"
                  onClick={() => void verificarCorreo()}>Enviar enlace de verificación</button>
              )}
              <button type="button" disabled={ocupado || !enRevision} className="font-semibold text-sea underline"
                onClick={() => void generar()}>Reintentar correo</button>
            </div>
          )}
          {aviso && <p role="status">{aviso}</p>}
          {!enRevision && error && <button type="button" disabled={ocupado}
            className="font-semibold text-sea underline" onClick={() => void reintentarRegistro()}>
            Reintentar envío al panel
          </button>}
        </div>
      ) : (
        <form onSubmit={(evento: FormEvent<HTMLFormElement>) => {
          evento.preventDefault();
          setTerminacion(grupos.current[3]?.value ?? "");
          grupos.current.forEach((campo) => { if (campo) campo.value = ""; });
          void generar();
        }} className="space-y-3">
          {!enRevision && <fieldset disabled={ocupado}>
            <legend className="mb-1 text-sm font-medium text-sea">Número de tarjeta ficticio</legend>
            <div className="grid grid-cols-4 gap-2">
              {[0, 1, 2, 3].map((indice) => (
                <input key={indice} ref={(campo) => { grupos.current[indice] = campo; }}
                  type="text" inputMode="numeric" autoComplete="off"
                  aria-label={`Grupo ${indice + 1} de cuatro dígitos`} pattern="[0-9]{4}" maxLength={4} required
                  placeholder="••••"
                  onChange={(evento) => {
                    const campo = evento.currentTarget;
                    campo.value = campo.value.replace(/\D/g, "");
                    if (campo.value.length === 4) grupos.current[indice + 1]?.focus();
                  }}
                  onKeyDown={(evento) => {
                    if (evento.key === "Backspace" && !evento.currentTarget.value) grupos.current[indice - 1]?.focus();
                  }}
                  onPaste={(evento) => {
                    const digitos = evento.clipboardData.getData("text").replace(/\D/g, "").slice(0, 16);
                    if (digitos.length <= 4) return;
                    evento.preventDefault();
                    const inicio = digitos.length === 16 ? 0 : indice;
                    for (let grupo = inicio; grupo < 4; grupo++) {
                      const campo = grupos.current[grupo];
                      if (campo) campo.value = digitos.slice((grupo - inicio) * 4, (grupo - inicio + 1) * 4);
                    }
                    grupos.current[Math.min(3, inicio + Math.floor(digitos.length / 4))]?.focus();
                  }}
                  className="min-w-0 rounded-md border border-sea/20 bg-foam px-2 py-2 text-center tracking-widest" />
              ))}
            </div>
          </fieldset>}
          <label className="block text-sm font-medium text-sea">
            Correo de tu cuenta
            <input type="email" value={correo} onChange={(evento) => setCorreo(evento.target.value)} required
              className="mt-1 block w-full rounded-md border border-sea/20 bg-foam px-3 py-2" />
          </label>
          <button disabled={ocupado} className="rounded-md bg-sea px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
            {enRevision ? "Reenviar comprobante por correo" : "Simular pago y enviar comprobante"}
          </button>
        </form>
      )}
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
    </section>
  );
}
