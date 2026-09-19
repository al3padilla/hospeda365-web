import { Suspense } from "react";
import PageShell from "../../components/PageShell";
import ConfirmacionReserva from "../../components/ConfirmacionReserva";
import { PageLoader } from "../../components/Loader";
import { esperar } from "../../datos/carga";

type PageProps = {
  searchParams: Promise<{
    habitacion?: string;
    checkIn?: string;
    checkOut?: string;
  }>;
};

async function ConfirmacionContent({ searchParams }: PageProps) {
  const [params] = await Promise.all([searchParams, esperar()]);

  return (
    <ConfirmacionReserva
      habitacionId={params.habitacion}
      checkInInicial={params.checkIn}
      checkOutInicial={params.checkOut}
    />
  );
}

export default function ConfirmacionPage(props: PageProps) {
  return (
    <PageShell>
      <Suspense fallback={<PageLoader titulo="Cargando confirmación…" />}>
        <ConfirmacionContent {...props} />
      </Suspense>
    </PageShell>
  );
}
