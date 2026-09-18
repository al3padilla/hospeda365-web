import PageShell from "../../components/PageShell";
import ConfirmacionReserva from "../../components/ConfirmacionReserva";

type PageProps = {
  searchParams: Promise<{
    habitacion?: string;
    checkIn?: string;
    checkOut?: string;
  }>;
};

export default async function ConfirmacionPage({ searchParams }: PageProps) {
  const params = await searchParams;

  return (
    <PageShell>
      <ConfirmacionReserva
        habitacionId={params.habitacion}
        checkInInicial={params.checkIn}
        checkOutInicial={params.checkOut}
      />
    </PageShell>
  );
}
