import { SOBRE_HOTEL } from "../datos/contenido";

export default function SobreHotel() {
  return (
    <section id="sobre" className="bg-foam py-16 sm:py-20">
      <div className="container mx-auto px-4 grid gap-10 lg:grid-cols-2 lg:items-center">
        <div
          className="min-h-[280px] sm:min-h-[360px] rounded-lg bg-cover bg-center"
          style={{ backgroundImage: "url(/imagenes/inicio/carru2.jpg)" }}
          role="img"
          aria-label="Vista del Hotel Terra Azul"
        />
        <div>
          <p className="font-[family-name:var(--font-script)] text-3xl text-mist mb-1">
            {SOBRE_HOTEL.script}
          </p>
          <h2 className="font-[family-name:var(--font-display)] text-4xl text-sea mb-4">
            {SOBRE_HOTEL.titulo}
          </h2>
          <p className="text-mist leading-relaxed text-lg max-w-xl">
            {SOBRE_HOTEL.texto}
          </p>
        </div>
      </div>
    </section>
  );
}
