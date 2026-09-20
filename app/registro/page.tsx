import type { Metadata } from "next";
import PageShell from "../../components/PageShell";
import FormularioRegistro from "../../components/FormularioRegistro";

export const metadata: Metadata = {
  title: "Crear cuenta | Hotel Terra Azul",
  description:
    "Regístrate en Hotel Terra Azul para reservar habitaciones frente al mar.",
};

export default function RegistroPage() {
  return (
    <PageShell whatsapp={false}>
      <FormularioRegistro />
    </PageShell>
  );
}
