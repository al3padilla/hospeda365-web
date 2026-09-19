import { Suspense } from "react";
import PageShell from "../../components/PageShell";
import HistorialReservas from "../../components/HistorialReservas";
import { PageLoader } from "../../components/Loader";
import { esperar } from "../../datos/carga";

async function HistorialContent() {
  await esperar();
  return <HistorialReservas />;
}

export default function HistorialPage() {
  return (
    <PageShell>
      <Suspense fallback={<PageLoader titulo="Cargando tus reservas…" />}>
        <HistorialContent />
      </Suspense>
    </PageShell>
  );
}
