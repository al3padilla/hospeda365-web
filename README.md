# Hospeda365 Web

Plataforma web de **Hotel Terra Azul** impulsada por Hospeda365.  
Permite a los huéspedes explorar habitaciones, gestionar su cuenta y reservar, y al personal operar el panel administrativo.

**Producción:** [https://hospeda365-web.vercel.app/](https://hospeda365-web.vercel.app/)

---

## Stack

| Tecnología | Uso |
| --- | --- |
| **Next.js 16** | App Router y SSR |
| **React 19** | Interfaz |
| **TypeScript** | Tipado estático |
| **Tailwind CSS 4** | Estilos |
| **Firebase** | Auth + Cloud Firestore |
| **Lucide React** | Iconografía |

---

## Requisitos

- Node.js **20+**
- Proyecto Firebase con **Authentication** (Email/Password) y **Cloud Firestore**
- Cuenta administradora en Firestore: `users/{uid}` con `rol: "admin"`

---

## Configuración

```bash
npm ci
npm run dev
```

Crea un archivo `.env.local` (excluido de Git) con las variables del proyecto Firebase:

```dotenv
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

Los valores se obtienen en **Firebase Console → Project settings → Your apps**.

> Sin estas variables, la autenticación no estará disponible.

Abre [http://localhost:3000](http://localhost:3000) en desarrollo.

---

## Comandos

| Comando | Función |
| --- | --- |
| `npm run dev` | Servidor de desarrollo |
| `npm run lint` | Análisis estático |
| `npm run build` | Compilación de producción |
| `npm run start` | Servidor de producción |
| `npm run seed:firestore` | Migración idempotente de datos iniciales |

---

## Migración inicial

La migración carga seis habitaciones y nueve reservas desde `scripts/firestore.seed.json`.

Agrega temporalmente las siguientes variables a `.env.local`:

```dotenv
FIREBASE_SEED_EMAIL=
FIREBASE_SEED_PASSWORD=
```

La cuenta debe tener rol `admin` en Firestore. Ejecuta:

```bash
npm run seed:firestore
```

---

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

---

## Firebase

```bash
firebase deploy --only firestore:rules,firestore:indexes
```

La definición de colecciones, permisos e índices está documentada en [docs/firebase-firestore.md](docs/firebase-firestore.md).
