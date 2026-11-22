import { createHash } from "node:crypto";

function comprobantePdf(id: string, monto: number): Buffer {
  const lineas = [
    "Hospeda365 - Comprobante de simulacion",
    "Ejercicio universitario. Sin cargo ni valor fiscal.",
    `Reserva: ${id}`,
    `Monto simulado: USD ${monto.toFixed(2)}`,
  ];
  const contenido = "BT /F1 16 Tf 50 740 Td " +
    lineas.map((linea) => `(${linea}) Tj 0 -30 Td`).join("\n") + " ET";
  const objetos = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    `<< /Length ${Buffer.byteLength(contenido)} >>\nstream\n${contenido}\nendstream`,
  ];
  let pdf = "%PDF-1.4\n";
  const offsets = objetos.map((objeto, indice) => {
    const offset = Buffer.byteLength(pdf);
    pdf += `${indice + 1} 0 obj\n${objeto}\nendobj\n`;
    return offset;
  });
  const xref = Buffer.byteLength(pdf);
  pdf += "xref\n0 6\n0000000000 65535 f \n";
  pdf += offsets.map((offset) => `${String(offset).padStart(10, "0")} 00000 n \n`).join("");
  pdf += `trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return Buffer.from(pdf);
}

export async function POST(request: Request) {
  const token = request.headers.get("authorization")?.match(/^Bearer (\S+)$/)?.[1];
  if (!token) return Response.json({ error: "Inicia sesión para continuar." }, { status: 401 });

  const entrada = await request.json().catch(() => null);
  const id = entrada?.reservaId;
  const abrir = entrada?.abrir === true;
  const correo = typeof entrada?.correo === "string" ? entrada.correo.trim().toLowerCase() : "";
  if (typeof id !== "string" || !/^[\w-]{1,100}$/.test(id) || (!abrir && (!correo || correo.length > 254))) {
    return Response.json({ error: "Revisa el correo y la reserva." }, { status: 400 });
  }

  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  const proyecto = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (!apiKey || !proyecto) return Response.json({ error: "Firebase no está configurado." }, { status: 503 });

  try {
    const documento = await fetch(
      `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(proyecto)}/databases/(default)/documents/reservations/${id}`,
      { headers: { Authorization: `Bearer ${token}` }, cache: "no-store", signal: AbortSignal.timeout(8000) },
    );
    const datos = documento.ok ? (await documento.json()).fields : null;
    const monto = Number(datos?.total?.doubleValue ?? datos?.total?.integerValue);
    const nombre = `comprobante-simulado-${id}.pdf`;
    const estadoPago = datos?.estadoPago?.stringValue;
    const enviar = entrada?.enviar === true;
    const registrado = ["en_revision", "aprobado", "rechazado"].includes(estadoPago) &&
      datos?.comprobanteNombre?.stringValue === nombre &&
      (datos?.comprobanteGenerado?.booleanValue === true || Boolean(datos?.comprobanteUrl?.stringValue));
    if (abrir) {
      if (!registrado || !Number.isFinite(monto) || monto < 0) {
        return Response.json({ error: "El comprobante no está disponible." }, { status: 404 });
      }
      return new Response(new Uint8Array(comprobantePdf(id, monto)), {
        headers: { "Content-Type": "application/pdf", "Content-Disposition": `attachment; filename="${nombre}"`, "Cache-Control": "no-store" },
      });
    }

    const auth = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(apiKey)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken: token }),
      signal: AbortSignal.timeout(8000),
    });
    const cuenta = auth.ok ? (await auth.json()).users?.[0] : null;
    if (!cuenta || cuenta.email?.toLowerCase() !== correo) {
      return Response.json({ error: "Ingresa el correo de tu cuenta." }, { status: 403 });
    }
    const permitido = enviar ? registrado
      : datos?.estado?.stringValue === "confirmada" && ["sin_comprobante", "rechazado"].includes(estadoPago);
    if (datos?.usuarioId?.stringValue !== cuenta.localId || !permitido ||
        !Number.isFinite(monto) || monto < 0) {
      return Response.json({ error: "La reserva no está disponible para esta simulación." }, { status: 409 });
    }

    const pdf = comprobantePdf(id, monto).toString("base64");
    const claveCorreo = process.env.RESEND_API_KEY;
    const remitente = process.env.PAGO_SIMULADO_REMITENTE;
    let enviado = false;
    if (enviar && claveCorreo && remitente && cuenta.emailVerified === true) {
      const llave = createHash("sha256").update(`${proyecto}/${id}/${correo}/${monto}`).digest("hex");
      const envio = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${claveCorreo}`,
          "Content-Type": "application/json",
          "Idempotency-Key": `pago-simulado/${llave}`,
        },
        body: JSON.stringify({
          from: remitente,
          to: [correo],
          subject: "Comprobante de pago simulado | Hospeda365",
          text: "Adjuntamos el comprobante de tu simulación. Puedes adjuntarlo a tu reserva en Hospeda365.",
          attachments: [{ filename: nombre, content: pdf }],
        }),
        signal: AbortSignal.timeout(8000),
      }).catch(() => null);
      enviado = envio?.ok === true;
    }
    return Response.json({ nombre, pdf, enviado, correoVerificado: cuenta.emailVerified === true }, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return Response.json({ error: "El servidor no pudo conectarse a Firebase. Intenta de nuevo en unos momentos." }, { status: 502 });
  }
}
