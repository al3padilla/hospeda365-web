import { TreePalm } from "lucide-react";

const FOOTER_LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/#sobre", label: "Sobre el hotel" },
  { href: "/#amenidades", label: "Amenidades" },
  { href: "/#daypass", label: "Day Pass" },
  { href: "/#habitaciones", label: "Habitaciones" },
  { href: "/historial", label: "Mis reservas" },
  { href: "/#buscar", label: "Reservar" },
] as const;

export default function Footer() {
  return (
    <footer className="mt-auto bg-sea-deep text-white">
      <div className="container mx-auto grid gap-10 px-4 py-12 sm:grid-cols-3">
        <div>
          <div className="mb-1 flex items-center gap-2.5">
            <TreePalm className="h-8 w-8 shrink-0 text-coral" aria-hidden />
            <p className="font-[family-name:var(--font-display)] text-2xl">
              Hotel terra azul
            </p>
          </div>
          <p className="mb-4 text-[11px] tracking-[0.12em] text-white/50">
            by Hospeda365
          </p>
          <p className="max-w-xs text-sm leading-relaxed text-white/70">
            Hotel frente al mar. Estancias cómodas, reservas simples y atención
            personalizada.
          </p>
        </div>

        <div>
          <h3 className="mb-4 font-semibold tracking-wide">Contacto</h3>
          <ul className="space-y-2 text-sm text-white/70">
            <li>Av. Costera 365, Playa Azul</li>
            <li>
              <a href="tel:+50373081253" className="transition hover:text-coral">
                503 73081253
              </a>
            </li>
            <li>
              <a
                href="mailto:contacto@hotelterraazul.com"
                className="transition hover:text-coral"
              >
                contacto@hotelterraazul.com
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="mb-4 font-semibold tracking-wide">Enlaces rápidos</h3>
          <ul className="space-y-2 text-sm text-white/70">
            {FOOTER_LINKS.map((link) => (
              <li key={link.href}>
                <a href={link.href} className="transition hover:text-coral">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 py-4 text-center text-xs text-white/40">
        © {new Date().getFullYear()} Hotel Terra Azul · Hospeda365
      </div>
    </footer>
  );
}
