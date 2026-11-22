import { obtenerAuth } from "./firebase";

export async function descargarComprobanteSimulado(id: string) {
  const token = await obtenerAuth().currentUser?.getIdToken();
  if (!token) throw new Error("Sesión requerida.");
  const respuesta = await fetch("/api/pago-simulado", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ reservaId: id, abrir: true }),
  });
  if (!respuesta.ok) throw new Error("Comprobante no disponible.");
  const url = URL.createObjectURL(await respuesta.blob());
  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = `comprobante-simulado-${id}.pdf`;
  enlace.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
