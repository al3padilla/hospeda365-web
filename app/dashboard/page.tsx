import type { Metadata } from "next";
import PageShell from "../../components/PageShell";
import DashboardResumen from "../../components/DashboardResumen";

export const metadata: Metadata = {
  title: "Dashboard | Hotel Terra Azul",
  description:
    "Panel administrativo: ocupación, ganancias mensuales y reservas pendientes.",
};

export default function DashboardPage() {
  return (
    <PageShell whatsapp={false}>
      <DashboardResumen />
    </PageShell>
  );
}
