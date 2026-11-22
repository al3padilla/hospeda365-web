# Inicio de sesión con Facebook

La aplicación web usa Firebase Authentication como intermediario del acceso con
Facebook. El App Secret se configura únicamente en Firebase Console y nunca se
guarda en el repositorio, variables públicas o Vercel.

## Configuración externa

1. En Meta for Developers, usa la aplicación **Hospeda365**.
2. En Firebase Console, abre Authentication, habilita Facebook y registra allí
   el App ID y el App Secret de Meta.
3. En la configuración de Facebook Login de Meta, registra como URL OAuth válida:
   `https://hospeda365-ee59d.firebaseapp.com/__/auth/handler`.
4. En Firebase Authentication, confirma que `localhost` y el dominio publicado
   en Vercel estén en la lista de dominios autorizados.
5. Mientras la aplicación de Meta esté en modo desarrollo, prueba únicamente
   con cuentas agregadas como administradores, desarrolladores o testers.

## Comportamiento

- Una cuenta nueva obtiene un documento `users/{uid}` con rol fijo `huesped`.
- Un perfil existente conserva su rol y estado.
- Las cuentas inactivas no pueden iniciar sesión.
- Si Facebook no comparte un correo, no se crea el perfil.
- Si el correo ya pertenece a otro proveedor, el usuario debe entrar primero
  con ese método de acceso.
