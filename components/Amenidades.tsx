import {
  BedDouble,
  Clock,
  PartyPopper,
  SquareParking,
  Sun,
  UtensilsCrossed,
  Waves,
  Wifi,
} from "lucide-react";
import { AMENIDADES } from "../datos/contenido";

const ICONOS = {
  bed: BedDouble,
  utensils: UtensilsCrossed,
  waves: Waves,
  sun: Sun,
  parking: SquareParking,
  party: PartyPopper,
  wifi: Wifi,
  clock: Clock,
} as const;

export default function Amenidades() {
  return (
    <section id="amenidades" className="py-16 sm:py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-xl mb-10">
          <p className="font-[family-name:var(--font-script)] text-3xl text-mist mb-1">
            Todo lo que necesitas
          </p>
          <h2 className="font-[family-name:var(--font-display)] text-4xl text-sea mb-3">
            Nuestras amenidades
          </h2>
          <p className="text-mist leading-relaxed">
            Entretenimiento y descanso en un solo lugar, pensado para tu día de
            playa o tu estancia completa.
          </p>
        </div>

        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {AMENIDADES.map((item) => {
            const Icono = ICONOS[item.icono];
            return (
              <li key={item.id} className="flex items-start gap-3">
                <Icono
                  className="h-7 w-7 shrink-0 text-sea mt-0.5"
                  strokeWidth={1.6}
                  aria-hidden
                />
                <span className="text-sea font-medium leading-snug">
                  {item.titulo}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
