# Hospeda365 Web

Aplicación web de gestión hotelera desarrollada con Next.js, React, TypeScript, Tailwind CSS y Firebase.

## Requisitos

- Node.js 20 o superior
- Proyecto Firebase con Authentication y Cloud Firestore habilitados
- Cuenta administradora registrada en `users/{uid}` con `rol: "admin"`

## Configuración

```bash
npm ci
npm run dev
```

Crear `.env.local` con las variables del proyecto Firebase. El archivo está excluido de Git.

Variables requeridas:

```dotenv
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

## Comandos

| Comando | Función |
| --- | --- |
| `npm run dev` | Servidor de desarrollo |
| `npm run lint` | Análisis estático |
| `npm run build` | Compilación de producción |
| `npm run start` | Servidor de producción |
| `npm run seed:firestore` | Migración idempotente de datos iniciales |

## Migración inicial

La migración carga seis habitaciones y nueve reservas desde `scripts/firestore.seed.json`.

Agregar temporalmente las siguientes variables a `.env.local`:

```dotenv
FIREBASE_SEED_EMAIL=
FIREBASE_SEED_PASSWORD=
```

La cuenta debe tener rol `admin` en Firestore. Ejecutar:

```bash
npm run seed:firestore
```

## Estructura

| Ruta | Responsabilidad |
| --- | --- |
| `app/` | Rutas y páginas |
| `components/` | Componentes visuales |
| `contexto/` | Estado global y suscripciones en tiempo real |
| `servicios/` | Firebase Auth y operaciones de Firestore |
| `datos/` | Tipos y utilidades puras |
| `scripts/` | Datos y script de migración |
| `docs/` | Especificación técnica |

## Firebase

```bash
firebase deploy --only firestore:rules,firestore:indexes
```

La definición de colecciones, permisos e índices está documentada en [docs/firebase-firestore.md](docs/firebase-firestore.md).
