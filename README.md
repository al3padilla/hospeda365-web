# Hospeda365 Web — Hotel Terra Azul

Frontend del hotel **Terra Azul** (Hospeda365).  
**React + Next.js + TypeScript + Tailwind CSS**.

## Inicio rápido

```bash
npm install
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000).

| Comando | Uso |
|---------|-----|
| `npm run dev` | Desarrollo |
| `npm run build` | Build de producción |
| `npm run start` | Servir producción |

## Dependencias relevantes

- **lucide-react** — iconos (`TreePalm`, etc.). Catálogo: [lucide.dev/icons](https://lucide.dev/icons)

## Imágenes

Guardar archivos en `public/imagenes/` (carrusel: `inicio/`, habitaciones: `habitaciones/`) y registrar las rutas en `datos/`.

## Notas

- UI en `components/`; datos mock en `datos/`; estado compartido en `contexto/` (Context API).
- La API REST y el estado global completo posteriormente.
