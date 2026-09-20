# Base de datos en Firebase — Hospeda365

Diseño de la base de datos del sistema hotelero y guía para conectarla con la
app. Escrito para el equipo: explica **qué** se crea, **por qué** se diseñó así
y **cómo** se enchufa al código que ya existe.

---

## 1. Qué es cada pieza de Firebase

Firebase no es "una base de datos". Son varios servicios, y este proyecto usa
tres. Confundirlos es el error más común al empezar.

**Firebase Authentication** guarda las credenciales: correo y contraseña. Es un
servicio separado de la base de datos, y esto es deliberado — las contraseñas
nunca tocan Firestore. Google las guarda con hashing (scrypt) y jamás las
devuelve, ni siquiera al dueño del proyecto. Cuando alguien inicia sesión,
Authentication entrega un **UID**, que es un identificador único y permanente
de esa persona.

**Cloud Firestore** es la base de datos propiamente dicha: guarda el perfil del
usuario, las habitaciones y las reservas. Es NoSQL de documentos, no relacional.
Aquí es donde va todo el modelado.

**Cloud Storage** guarda archivos binarios: las fotos de las habitaciones y los
comprobantes de pago que Recepción tiene que validar. En Firestore sólo se
guarda la **URL** del archivo, nunca el archivo.

El vínculo entre los tres es el UID. Authentication lo genera, y ese mismo UID
se usa como ID del documento en la colección `users` de Firestore. Así, dado un
usuario autenticado, su perfil se encuentra con una sola lectura directa, sin
buscar ni filtrar nada.

---

## 2. Firestore no es SQL: la diferencia que importa

Si vienes de MySQL, el instinto es normalizar: tablas separadas y `JOIN` para
unirlas. **Firestore no tiene JOIN.** Ninguno. Si una pantalla necesita datos de
dos colecciones, o haces dos consultas, o duplicas el dato.

La estructura es: una **colección** contiene **documentos**, y cada documento es
un objeto con campos. Un documento puede contener **subcolecciones**.

```
colección          documento               campos
─────────          ─────────               ──────
users         →    {uid}              →    email, nombre, rol, activo…
rooms         →    {roomId}           →    numero, estado, precioNoche…
                     └─ historial/    →    (subcolección de auditoría)
reservations  →    {reservaId}        →    usuarioId, habitacionId, total…
payments      →    {pagoId}           →    reservaId, monto, estado…
metrics       →    {2026-09}          →    ocupacion, ingresos, pendientes…
```

Y el segundo principio, que es el que más sorprende: **se cobra por documento
leído, no por el tamaño del dato**. Leer 100 documentos de 10 campos cuesta 100
lecturas. Leer 1 documento de 1000 campos cuesta 1 lectura. Eso cambia por
completo cómo se diseña — y explica las dos decisiones siguientes.

---

## 3. Las dos decisiones de diseño que hay que saber explicar

### Duplicar datos a propósito (desnormalización)

En el modelo `Reservation` (ver `datos/usuarios.ts`) hay campos que parecen
redundantes:

```ts
habitacionId: string;       // la referencia "correcta"
habitacionNumero: string;   // ← duplicado desde rooms
huespedNombre: string;      // ← duplicado desde users
```

Parece un error de normalización, pero es intencional. El panel CRUD de Jonathan
y Marlene lista reservas mostrando el número de habitación y el nombre del
huésped. Sin duplicar: 50 reservas = 1 consulta + 50 lecturas de `rooms` + 50 de
`users` = **101 lecturas**. Con los datos duplicados en la reserva: **1 sola
consulta**. Cien veces más barato y notablemente más rápido.

El costo de esta decisión es que si un huésped cambia su nombre, las reservas
viejas conservan el nombre anterior. Para reservas históricas eso es
**correcto**: son un registro de lo que pasó en ese momento, como una factura.

### Precalcular las métricas del Dashboard

El Dashboard de Alexander necesita porcentaje de ocupación, ingresos del mes y
reservas pendientes. Calcular eso leyendo todas las reservas del mes serían
cientos de lecturas **cada vez que alguien abre el dashboard**.

La solución es la colección `metrics`, con un documento por mes (`2026-09`) que
guarda los totales ya calculados. El dashboard hace **1 lectura**. Los totales
los actualiza una Cloud Function cuando cambia una reserva, y las reglas de
seguridad prohíben que el cliente escriba ahí — si no, cualquiera podría
falsear los ingresos del hotel.

---

## 4. Estructura de las colecciones

### `users/{uid}`

El ID del documento **es** el UID de Firebase Authentication. Nunca un campo
`id` dentro del documento, ni un autogenerado.

```js
{
  email: "jason@example.com",     // string, minúsculas
  nombre: "Jason",
  apellido: "Sosa",
  telefono: "+503 7000 0003",     // string | null
  rol: "huesped",                 // "huesped" | "recepcionista" | "admin"
  fotoUrl: null,                  // string | null → Cloud Storage
  activo: true,                   // borrado lógico
  creadoEn: Timestamp,
  actualizadoEn: Timestamp
}
```

`rol` es el campo más sensible del sistema: de él dependen todas las reglas de
seguridad. Por eso las reglas impiden que un usuario modifique su propio `rol`
(sección 6).

`activo` implementa borrado lógico. Los usuarios nunca se borran de verdad:
si se borraran, sus reservas quedarían huérfanas y los ingresos históricos del
dashboard cambiarían retroactivamente.

### `rooms/{roomId}`

```js
{
  numero: "102",
  piso: 1,
  tipo: "doble",                  // individual | doble | suite | familiar
  estado: "ocupada",              // disponible | ocupada | limpieza | mantenimiento
  capacidad: 2,
  precioNoche: 55.0,
  descripcion: "…",
  amenidades: ["wifi", "tv"],     // array de strings
  imagenes: ["https://…"],        // URLs de Cloud Storage
  activa: true,
  actualizadoEn: Timestamp
}
```

`estado` son los tres que pide la tarea más `mantenimiento`. Se separa de
`activa` a propósito: `estado` es la situación operativa del día a día, `activa`
indica si la habitación forma parte del catálogo.

La subcolección `rooms/{roomId}/historial/{eventoId}` es una bitácora de quién
cambió el estado y cuándo. Las reglas permiten crear pero no editar ni borrar:
una auditoría que se puede modificar no sirve de nada.

### `reservations/{reservaId}`

```js
{
  usuarioId: "uid_del_huesped",   // referencia a users
  habitacionId: "hab_102",
  habitacionNumero: "102",        // duplicado (sección 3)
  huespedNombre: "Jason Sosa",    // duplicado (sección 3)
  fechaEntrada: "2026-09-18",     // string YYYY-MM-DD, ordenable
  fechaSalida: "2026-09-21",
  numeroHuespedes: 2,
  noches: 3,
  total: 165.0,
  estado: "en_curso",             // pendiente|confirmada|en_curso|finalizada|cancelada
  estadoPago: "aprobado",         // sin_comprobante|en_revision|aprobado|rechazado
  comprobanteUrl: "https://…",    // string | null
  notas: null,
  creadaEn: Timestamp,
  actualizadaEn: Timestamp
}
```

Las fechas de estancia son strings `YYYY-MM-DD`, no Timestamps. Ese formato
ordena alfabéticamente igual que cronológicamente, lo que permite consultas de
rango sin líos de zona horaria — y un hotel razona en días de calendario, no en
instantes. `creadaEn` y `actualizadaEn` sí son Timestamps, porque ahí el
instante exacto sí importa.

### `payments/{pagoId}`

Los comprobantes viven en su propia colección, aunque la reserva ya tenga
`estadoPago`. La razón: la bandeja de Recepción necesita consultar *todos* los
comprobantes pendientes de todo el hotel, y eso es una consulta directa sobre
una colección de nivel superior. Además permite varios pagos por reserva
(anticipo + saldo) y deja rastro de auditoría de quién aprobó qué.

```js
{
  reservaId: "res_0002",
  usuarioId: "uid_del_huesped",
  monto: 360.0,
  metodo: "transferencia",
  comprobanteUrl: "https://…",
  estado: "en_revision",          // en_revision | aprobado | rechazado
  revisadoPor: null,              // uid del recepcionista
  motivoRechazo: null,
  subidoEn: Timestamp,
  revisadoEn: null
}
```

El campo `estadoPago` de la reserva es una copia del estado del último pago, para
poder listar reservas sin consultar `payments`. La misma lógica de la sección 3.

### `metrics/{periodo}`

Un documento por mes, ID con formato `2026-09`:

```js
{
  ocupacionPorcentaje: 68.5,
  habitacionesTotales: 6,
  habitacionesOcupadas: 4,
  ingresosMes: 1240.0,
  reservasPendientes: 2,
  comprobantesPorValidar: 1,
  actualizadoEn: Timestamp
}
```

---

## 5. Crear el proyecto (paso a paso)

1. Entrar a [console.firebase.google.com](https://console.firebase.google.com)
   y crear un proyecto llamado `hospeda365`. Google Analytics se puede
   desactivar; no hace falta para esto.

2. En **Compilación → Authentication → Comenzar**, habilitar el proveedor
   **Correo electrónico/contraseña**.

3. En **Compilación → Firestore Database → Crear base de datos**, elegir
   **modo de producción** (nunca modo de prueba: deja la base abierta a
   cualquiera durante 30 días) y la ubicación `us-central1` o `southamerica-east1`.

4. En **Compilación → Storage**, habilitarlo para las imágenes y comprobantes.

5. En **⚙️ Configuración del proyecto → Tus apps → Web (`</>`)**, registrar una
   app web. Firebase muestra un objeto `firebaseConfig`: esos son los datos que
   van en el archivo `.env.local` del paso siguiente.

> **Sobre la `apiKey`:** no es un secreto. Identifica al proyecto, no autoriza
> nada. Google la expone en el cliente a propósito. Lo que realmente protege los
> datos son las reglas de seguridad. Aun así, el `.env.local` no se sube al
> repositorio, porque ahí acaban acumulándose otras cosas que sí son secretas.

---

## 6. Las reglas de seguridad (`firestore.rules`)

Este es el punto más importante de todo el documento, y el que más peso tiene
en una evaluación.

**El código del navegador no protege nada.** Todo lo que corre en el cliente es
visible con abrir las herramientas de desarrollo, y cualquiera con la `apiKey`
puede llamar a la API de Firestore directamente desde la consola, sin pasar por
nuestras pantallas. Las validaciones del formulario son comodidad para el
usuario. **La seguridad real vive en `firestore.rules`**, que se ejecuta en los
servidores de Google.

Esto vale también para los Server Components de Next.js: lo que se renderiza en
el servidor no impide que alguien golpee Firestore por su cuenta.

Las tres reglas que sostienen el sistema:

```js
// 1. Nadie puede auto-asignarse un rol de personal al registrarse.
allow create: if esDueno(userId)
              && request.resource.data.rol == 'huesped';

// 2. Nadie puede cambiar su propio rol después.
allow update: if (esDueno(userId) && noModifica(['rol', 'email', 'activo']))
              || esAdmin();

// 3. Sólo el personal aprueba comprobantes de pago.
//    Sin esto, un huésped se auto-aprobaría su propio pago.
allow update: if esPersonal() && activo()
              && request.resource.data.estado in ['aprobado', 'rechazado', 'en_revision'];
```

El archivo completo está en `firestore.rules`, comentado regla por regla.
Se despliega con `firebase deploy --only firestore:rules` y se prueba en local
con `firebase emulators:start --only firestore`.

---

## 7. Índices (`firestore.indexes.json`)

Firestore crea índices de un solo campo automáticamente, pero cualquier consulta
que combine varios campos necesita un **índice compuesto declarado**. Si falta,
la consulta no devuelve datos incompletos: **falla** con un error que incluye un
enlace para crear el índice.

Los índices que necesitan los módulos del equipo ya están en
`firestore.indexes.json` — reservas por estado, la bandeja de comprobantes
pendientes, disponibilidad por rango de fechas, ingresos del mes y el catálogo
filtrado. Se despliegan con `firebase deploy --only firestore:indexes`.

---

## 8. Conectar Firebase con el código que ya existe

Aquí está lo importante: **el módulo de autenticación ya está preparado**. No
hay que reescribir pantallas ni el estado global.

Todo el código habla con una interfaz, `ServicioAuth`
(`servicios/tiposAuth.ts`), que define `login`, `registrar`, `logout`,
`restaurarSesion` y `actualizarPerfil`. Hoy la implementa `authMock.ts`
leyendo los datos de `datos/usuarios.ts`. Al conectar Firebase, la implementa
`authFirebase.ts` — que ya está escrito y comentado dentro de ese mismo
archivo, listo para activarse.

La migración completa:

```bash
npm install firebase
```

Crear `.env.local` con los datos del paso 5:

```
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=hospeda365.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=hospeda365
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=hospeda365.appspot.com
NEXT_PUBLIC_FIREBASE_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

Crear `servicios/firebase.ts` (la plantilla está en la cabecera de
`authFirebase.ts`), descomentar el código de ese archivo, y en
`servicios/index.ts` cambiar dos líneas:

```ts
import { authFirebase } from "./authFirebase";   // descomentar
const USAR_MOCKS = false;                        // era true
export const servicioAuth: ServicioAuth = USAR_MOCKS
  ? authMock
  : authFirebase;                                // cambiar
```

**Eso es todo.** Las páginas `/login`, `/registro` y `/mi-cuenta`, el
`AuthContext`, el reducer, el Navbar y los componentes no cambian ni una línea.
Esa es exactamente la razón de haber puesto una interfaz en medio en lugar de
llamar a Firebase directamente desde los componentes.

Una pieza queda pendiente: `authFirebase.ts` traduce los códigos de
error de Firebase (`auth/wrong-password`, `auth/email-already-in-use`…) a los
códigos propios del sistema (`credenciales_invalidas`, `email_ya_registrado`).
Gracias a eso, la UI muestra los mismos mensajes en español sin saber que existe
Firebase.

---

## 9. Datos iniciales

Los mocks de `datos/` tienen la misma forma que los documentos de Firestore,
así que sirven como semilla. Para cargarlos hay dos caminos: crear los usuarios
a mano desde la consola de Firebase (Authentication → Agregar usuario, y luego
el documento en `users` con ese mismo UID), que es suficiente para tres o cuatro
cuentas de prueba; o escribir un script con el Admin SDK, que se justifica a
partir de ahí.

Las habitaciones de `datos/habitaciones.ts` y las reservas de
`datos/historialReservas.ts` se pueden importar tal cual, con dos ajustes: los
campos de fecha (`creadoEn`, `actualizadoEn`) deben convertirse a `Timestamp`,
y el campo `password` de `datos/usuarios.ts` **no se importa nunca** — esas
credenciales van a Firebase Authentication, no a Firestore.

---

## 10. Resumen para la evaluación

El sistema separa credenciales (Authentication), datos (Firestore) y archivos
(Storage), y las une por el UID. El modelo duplica ciertos campos a propósito,
porque Firestore no tiene JOIN y cobra por documento leído. Las métricas del
dashboard se precalculan en lugar de recorrerse. La seguridad no está en la app
sino en las reglas del servidor, que impiden que alguien se asigne un rol de
personal o se apruebe su propio pago. Y la app se conecta a través de una
interfaz, de modo que pasar de mocks a Firebase es cambiar un archivo.
