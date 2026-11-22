import type { Metadata } from "next";
import PageShell from "../../components/PageShell";
import FormularioLogin from "../../components/FormularioLogin";

export const metadata: Metadata = {
  title: "Iniciar sesión | Hotel Terra Azul",
  description:
    "Accede a tu cuenta de Hotel Terra Azul para ver tus reservas y gestionar tu estancia.",
};

type LoginPageProps = {
  searchParams: Promise<{ redirect?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { redirect } = await searchParams;

  return (
    <PageShell whatsapp={false}>
      <FormularioLogin redirectTo={redirect} />
    </PageShell>
  );
}
