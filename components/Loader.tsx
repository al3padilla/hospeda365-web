import { Loader2 } from "lucide-react";

type SpinnerProps = {
  className?: string;
  label?: string;
};

export function Spinner({
  className = "h-4 w-4 text-coral",
  label,
}: SpinnerProps) {
  return (
    <Loader2
      className={`animate-spin ${className}`}
      aria-hidden={!label}
      aria-label={label}
    />
  );
}

type LoaderInlineProps = {
  texto?: string;
  className?: string;
};

export function LoaderInline({
  texto = "Cargando…",
  className = "",
}: LoaderInlineProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 py-12 text-mist ${className}`}
      role="status"
      aria-live="polite"
    >
      <Spinner className="h-8 w-8 text-coral" label={texto} />
      <p className="text-sm font-medium">{texto}</p>
    </div>
  );
}

type PageLoaderProps = {
  titulo?: string;
  subtitulo?: string;
};

export function PageLoader({
  titulo = "Cargando…",
  subtitulo = "Preparando tu experiencia en Hotel Terra Azul",
}: PageLoaderProps) {
  return (
    <div
      className="flex min-h-[70vh] flex-col items-center justify-center gap-5 bg-background px-4"
      role="status"
      aria-live="polite"
      aria-label={titulo}
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-full border border-sea/10 bg-foam shadow-sm">
        <Spinner className="h-8 w-8 text-coral" label={titulo} />
      </div>
      <div className="text-center">
        <p className="font-[family-name:var(--font-display)] text-2xl text-sea">
          {titulo}
        </p>
        <p className="mt-1 text-sm text-mist">{subtitulo}</p>
      </div>
      <div className="mt-2 flex gap-1.5" aria-hidden>
        <span className="h-2 w-2 animate-pulse rounded-full bg-coral" />
        <span className="h-2 w-2 animate-pulse rounded-full bg-coral/70 [animation-delay:150ms]" />
        <span className="h-2 w-2 animate-pulse rounded-full bg-coral/40 [animation-delay:300ms]" />
      </div>
    </div>
  );
}

type SkeletonProps = {
  className?: string;
};

export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded-md bg-sea/20 ${className}`}
      aria-hidden
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-lg border border-sea/10 bg-foam">
      <Skeleton className="h-44 w-full rounded-none" />
      <div className="space-y-3 p-5">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <div className="flex justify-between pt-2">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-9 w-28" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonReserva() {
  return (
    <div className="flex overflow-hidden rounded-xl border border-sea/10 bg-foam sm:flex-row">
      <Skeleton className="h-36 w-full shrink-0 rounded-none sm:h-auto sm:w-40" />
      <div className="flex flex-1 flex-col gap-3 p-4 sm:py-5 sm:pr-5">
        <div className="flex justify-between gap-2">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-6 w-24" />
        </div>
        <Skeleton className="h-4 w-52" />
        <div className="mt-auto flex justify-between pt-1">
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-6 w-16" />
        </div>
      </div>
    </div>
  );
}

type SkeletonGridProps = {
  count?: number;
  variant?: "card" | "reserva";
  className?: string;
};

export function SkeletonGrid({
  count = 3,
  variant = "card",
  className = "grid gap-8 sm:grid-cols-2 lg:grid-cols-3",
}: SkeletonGridProps) {
  const Item = variant === "reserva" ? SkeletonReserva : SkeletonCard;

  return (
    <div className={className}>
      {Array.from({ length: count }, (_, i) => (
        <Item key={i} />
      ))}
    </div>
  );
}
