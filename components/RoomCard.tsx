type RoomCardProps = {
  name: string;
  description: string;
  pricePerNight: number;
  capacity: number;
  imageUrl?: string;
};

export default function RoomCard({
  name,
  description,
  pricePerNight,
  capacity,
  imageUrl,
}: RoomCardProps) {
  return (
    <article className="group flex flex-col bg-foam overflow-hidden border border-sea/10 rounded-lg transition hover:border-sea/25">
      <div className="h-56 overflow-hidden bg-sea/20">
        <div
          className="h-full w-full bg-cover bg-center transition duration-500 group-hover:scale-[1.04]"
          style={
            imageUrl ? { backgroundImage: `url(${imageUrl})` } : undefined
          }
          role="img"
          aria-label={name}
        />
      </div>
      <div className="p-5 flex flex-col flex-1 gap-3">
        <h3 className="font-[family-name:var(--font-display)] text-2xl text-sea">
          {name}
        </h3>
        <p className="text-mist text-sm leading-relaxed flex-1">{description}</p>
        <div className="flex items-center justify-between text-sm">
          <span className="text-mist">
            Hasta {capacity} persona{capacity === 1 ? "" : "s"}
          </span>
          <span className="font-semibold text-sea">
            ${pricePerNight.toLocaleString("es-MX")}
            <span className="font-normal text-mist"> / noche</span>
          </span>
        </div>
        <a
          href="#"
          className="mt-1 inline-block text-center bg-sea text-white px-4 py-2.5 rounded-md font-semibold tracking-wide hover:bg-sea-deep transition"
        >
          Ver detalle
        </a>
      </div>
    </article>
  );
}
