# Pruebas cruzadas entre la app y la web

## Preparación

- Usa la rama `pruebas-cruzadas-tiempo-real` en ambos repositorios. La rama móvil parte de `origin/main`, que ya incluye las suscripciones de Firestore.
- Configura ambos clientes con el mismo proyecto Firebase de pruebas y prepara una cuenta de huésped y una cuenta de personal. Usa una habitación activa y dos comprobantes ficticios.
- Habilita Cloud Storage y configura el bucket en el entorno de la app. Aplica las reglas de Firestore y Storage de la rama web al proyecto de pruebas. Storage debe tener permiso para consultar los perfiles de Firestore mediante sus reglas.
- Abre la app en Android y el panel web con la cuenta de personal. Abre el Dashboard en otra pestaña y anota los valores iniciales de sus métricas.
- Usa dos reservas de prueba distintas para aprobar una y rechazar la otra. Anota el ID y el monto de cada reserva. Mantén las pantallas observadas abiertas y registra el tiempo entre la acción y la actualización visible, sin recargar.

## Casos

| Caso | Acción | Resultado esperado |
| --- | --- | --- |
| Alta desde Android | Solicita una habitación. | La reserva aparece en la web con el mismo ID, estado pendiente y sin comprobante. |
| Confirmación inicial | Confirma la reserva desde Gestión de reservas. | Mis reservas muestra Pendiente de pagar sin recargar. |
| Pago simulado | Abre el simulador desde Mis reservas e ingresa cuatro grupos de dígitos ficticios. | Los dígitos son visibles al escribir y el resumen solo muestra los últimos cuatro. El PDF aparece en Comprobantes para ese ID y llega al correo verificado cuando el envío está configurado. |
| Aprobación | Abre el comprobante en la web y apruébalo. Mantén Mis reservas visible en Android. | La app muestra la reserva confirmada y el pago aprobado. El Dashboard resta un comprobante por validar y suma el monto a ingresos confirmados. |
| Rechazo | Crea otra reserva, confírmala y simula su pago. Rechaza el comprobante con Mis reservas visible. | La app muestra la reserva y el pago rechazados. El Dashboard resta un comprobante por validar. Los ingresos confirmados conservan su valor anterior. |
| Habitación | Cambia una habitación disponible a ocupada y luego a limpieza. Mantén abierto el catálogo móvil. | La habitación deja de estar disponible para reservar en el catálogo. El Dashboard incrementa el conteo de ocupadas al primer cambio, luego lo reduce y aumenta el de limpieza. |
| Restablecimiento | Devuelve la habitación a disponible. | El catálogo vuelve a ofrecerla para reservar y el Dashboard actualiza el conteo de disponibles. |

Para cada caso registra la versión de Android y la rama de ambos clientes, el ID de la reserva o habitación, la hora de la acción, la hora del cambio visible y una captura de cada pantalla.

## Pruebas automatizadas

Con Node 24 y las dependencias de ambos repositorios instaladas, ejecuta esto desde la raíz de la web. Sustituye la ruta de `$app` por la de la rama móvil.

```powershell
node --test scripts/metricas-panel.test.mjs
$app = 'C:/ruta/a/hospeda365-app'
node "$app/node_modules/firebase-tools/lib/bin/firebase.js" emulators:exec --project demo-hospeda365-cross --config firebase.json --only firestore,storage ('node "' + $app + '/tests/pruebas-cruzadas.cjs"')
```

La prueba de emuladores usa dos clientes para comprobar la creación, la aprobación y el rechazo de reservas, la propagación del estado de habitación y los permisos de lectura del comprobante.

## Estado de la validación

La ejecución en Android y navegador requiere una compilación de la rama móvil y un entorno Firebase compartido. Las reservas, los comprobantes y las habitaciones de esta guía son datos de prueba.
