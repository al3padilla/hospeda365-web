# Arquitectura Firebase

## Servicios

- Firebase Authentication: autenticación por correo y contraseña.
- Cloud Firestore: usuarios, habitaciones y reservas.
- Context API: suscripciones de cliente y estado compartido.

## Colecciones

### `users/{uid}`

| Campo | Tipo | Descripción |
| --- | --- | --- |
| `email` | string | Correo normalizado |
| `nombre` | string | Nombre |
| `apellido` | string | Apellido |
| `telefono` | string/null | Teléfono |
| `rol` | string | `huesped`, `recepcionista` o `admin` |
| `activo` | boolean | Estado de la cuenta |
| `creadoEn` | timestamp | Fecha de creación |
| `actualizadoEn` | timestamp | Fecha de actualización |

El identificador del documento coincide con el UID de Authentication.

### `rooms/{roomId}`

| Campo | Tipo | Descripción |
| --- | --- | --- |
| `numero` | string | Número visible |
| `piso` | number | Piso |
| `nombre` | string | Nombre comercial |
| `tipo` | string | Categoría |
| `estado` | string | `disponible`, `ocupada`, `limpieza` o `mantenimiento` |
| `capacidad` | number | Capacidad máxima |
| `precioNoche` | number | Precio en USD |
| `descripcion` | string | Descripción |
| `amenidades` | string[] | Servicios incluidos |
| `imagenes` | string[] | Rutas o URL de imágenes |
| `activa` | boolean | Visibilidad en catálogo |
| `creadaEn` | timestamp | Fecha de creación |
| `actualizadaEn` | timestamp | Fecha de actualización |

### `reservations/{reservationId}`

| Campo | Tipo | Descripción |
| --- | --- | --- |
| `usuarioId` | string/null | UID del huésped |
| `habitacionId` | string | Referencia lógica de habitación |
| `habitacionNumero` | string | Número registrado al reservar |
| `habitacionNombre` | string | Nombre registrado al reservar |
| `habitacionImagenUrl` | string | Imagen registrada al reservar |
| `huespedNombre` | string | Nombre del huésped |
| `fechaEntrada` | string | Fecha ISO `YYYY-MM-DD` |
| `fechaSalida` | string | Fecha ISO `YYYY-MM-DD` |
| `numeroHuespedes` | number | Adultos y niños |
| `adultos` | number | Adultos |
| `ninos` | number | Niños |
| `bebes` | number | Bebés |
| `noches` | number | Número de noches |
| `precioNoche` | number | Precio registrado al reservar |
| `total` | number | Importe total |
| `estado` | string | `pendiente`, `confirmada`, `en_curso`, `finalizada`, `cancelada` o `rechazada` |
| `estadoPago` | string | `sin_comprobante`, `en_revision`, `aprobado` o `rechazado` |
| `comprobanteNombre` | string/null | Nombre del archivo |
| `comprobanteUrl` | string/null | URL del archivo |
| `notas` | string/null | Notas internas |
| `creadaEn` | timestamp | Fecha de creación |
| `actualizadaEn` | timestamp | Fecha de actualización |

Los datos de habitación se duplican deliberadamente para conservar el valor histórico de cada reserva.

## Contextos

| Contexto | Origen | Operaciones |
| --- | --- | --- |
| `AuthContext` | Authentication y `users` | Iniciar sesión, registrar, cerrar sesión, actualizar perfil |
| `HabitacionesContext` | `rooms` | Suscripción al catálogo, filtro por capacidad y estado |
| `ReservasContext` | `reservations` | Historial del usuario, creación y cancelación |
| `AdminContext` | `rooms` y `reservations` | Gestión de reservas, pagos y estado de habitaciones |

Las lecturas utilizan `onSnapshot` para sincronización en tiempo real.

## Seguridad

Las reglas de `firestore.rules` aplican:

- Lectura pública únicamente de habitaciones activas.
- Creación de perfiles con rol `huesped`.
- Lectura del perfil propio o por personal autorizado.
- Creación de reservas por el propietario autenticado o personal.
- Cancelación limitada al propietario de la reserva.
- Gestión operativa limitada a `recepcionista` y `admin`.
- Gestión de habitaciones limitada a `admin`.
- Eliminación física de reservas deshabilitada.

## Índices

Los índices compuestos se encuentran en `firestore.indexes.json`. El historial del huésped requiere el índice `usuarioId ASC, fechaEntrada DESC`.

## Migración

`scripts/seed-firestore.mjs` autentica una cuenta administradora y aplica `setDoc(..., { merge: true })` sobre los identificadores definidos en `scripts/firestore.seed.json`.

La migración no crea usuarios de Authentication ni asigna roles. La cuenta administradora debe existir antes de ejecutar el script.

## Comprobantes

El flujo actual registra `comprobanteNombre` en Firestore. La carga binaria requiere integrar Firebase Storage y guardar su URL en `comprobanteUrl`.
