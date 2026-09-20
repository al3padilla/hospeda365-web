import type { Metadata } from "next";
import PageShell from "../../components/PageShell";
import FormularioLogin from "../../components/FormularioLogin";

export const metadata: Metadata = {
  title: "Iniciar sesión | Hotel Terra Azul",
  description:
    "Accede a tu cuenta de Hotel Terra Azul para ver tus reservas y gestionar tu estancia.",
};

export default function LoginPage() {
  return (
    <PageShell whatsapp={false}>
      <FormularioLogin />
    </PageShell>
  );
}
