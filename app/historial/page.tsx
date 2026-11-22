import PageShell from "../../components/PageShell";
import HistorialReservas from "../../components/HistorialReservas";

export default async function HistorialPage({ searchParams }: PageProps<"/historial">) {
  const { reserva } = await searchParams;
  return (
    <PageShell>
      <HistorialReservas reservaInicial={typeof reserva === "string" ? reserva : undefined} />
    </PageShell>
  );
}
