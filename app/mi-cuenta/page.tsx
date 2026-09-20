import type { Metadata } from "next";
import PageShell from "../../components/PageShell";
import PanelCuenta from "../../components/PanelCuenta";

export const metadata: Metadata = {
  title: "Mi cuenta | Hotel Terra Azul",
  description: "Panel principal de tu cuenta en Hotel Terra Azul.",
};

export default function MiCuentaPage() {
  return (
    <PageShell>
      <PanelCuenta />
    </PageShell>
  );
}
