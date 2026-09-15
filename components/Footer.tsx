import { TreePalm } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-sea-deep text-white mt-auto">
      <div className="container mx-auto px-4 py-12 grid gap-10 sm:grid-cols-3">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <TreePalm className="h-8 w-8 shrink-0 text-coral" aria-hidden />
            <p className="font-[family-name:var(--font-display)] text-2xl">
              Hotel terra azul
            </p>
          </div>
          <p className="text-[11px] tracking-[0.12em] text-white/50 mb-4">
            by Hospeda365
          </p>
          <p className="text-sm text-white/70 leading-relaxed max-w-xs">
            Hotel frente al mar. Estancias cómodas, reservas simples y atención
            personalizada.
          </p>
        </div>

        <div>
          <h3 className="font-semibold mb-4 tracking-wide">Contacto</h3>
          <ul className="space-y-2 text-sm text-white/70">
            <li>Av. Costera 365, Playa Azul</li>
            <li>
              <a href="tel:+50373081253" className="hover:text-coral transition">
                503 73081253
              </a>
            </li>
            <li>
              <a
                href="mailto:contacto@hotelterraazul.com"
                className="hover:text-coral transition"
              >
                contacto@hotelterraazul.com
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold mb-4 tracking-wide">Enlaces rápidos</h3>
          <ul className="space-y-2 text-sm text-white/70">
            <li>
              <a href="#" className="hover:text-coral transition">
                Inicio
              </a>
            </li>
            <li>
              <a href="#sobre" className="hover:text-coral transition">
                Sobre el hotel
              </a>
            </li>
            <li>
              <a href="#amenidades" className="hover:text-coral transition">
                Amenidades
              </a>
            </li>
            <li>
              <a href="#daypass" className="hover:text-coral transition">
                Day Pass
              </a>
            </li>
            <li>
              <a href="#habitaciones" className="hover:text-coral transition">
                Habitaciones
              </a>
            </li>
            <li>
              <a href="#buscar" className="hover:text-coral transition">
                Reservar
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 py-4 text-center text-xs text-white/40">
        © {new Date().getFullYear()} Hotel Terra Azul · Hospeda365
      </div>
    </footer>
  );
}
