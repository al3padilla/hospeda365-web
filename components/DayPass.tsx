import { Check } from "lucide-react";
import { DAYPASS_INCLUYE } from "../datos/contenido";

export default function DayPass() {
  return (
    <section id="daypass" className="py-16 sm:py-20 bg-foam">
      <div className="container mx-auto px-4 grid gap-10 lg:grid-cols-2 lg:items-center">
        <div>
          <p className="font-[family-name:var(--font-script)] text-3xl text-mist mb-1">
            Día de playa en el paraíso
          </p>
          <h2 className="font-[family-name:var(--font-display)] text-4xl text-sea mb-3">
            Day Pass
          </h2>
          <p className="text-mist leading-relaxed mb-6 max-w-lg">
            Disfruta el hotel sin hospedarte: piscinas, playa, áreas comunes y un
            vale de consumo. Ideal para un día completo de sol y descanso.
          </p>
          <a
            href="https://wa.me/50373081253"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-sea text-white px-7 py-3 rounded-md font-semibold tracking-wide hover:bg-sea-deep transition"
          >
            Consultar Day Pass
          </a>
        </div>

        <div className="border border-sea/10 rounded-lg p-6 sm:p-8 bg-background">
          <h3 className="font-semibold text-sea text-lg mb-4 tracking-wide">
            ¿Qué incluye?
          </h3>
          <ul className="space-y-3">
            {DAYPASS_INCLUYE.map((item) => (
              <li key={item} className="flex items-start gap-3 text-mist">
                <Check
                  className="h-5 w-5 shrink-0 text-coral mt-0.5"
                  aria-hidden
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
