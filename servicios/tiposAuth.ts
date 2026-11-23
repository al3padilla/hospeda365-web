import type { Usuario } from "../datos/usuarios";

export type Credenciales = {
  email: string;
  password: string;
};

export type DatosRegistro = {
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  password: string;
  confirmPassword: string;
};

export type Sesion = {
  usuario: Usuario;
  token: string;
  /** Fecha ISO de expiración. */
  expiraEn: string;
};

/** Códigos independientes del proveedor de autenticación. */
export type CodigoErrorAuth =
  | "credenciales_invalidas"
  | "email_ya_registrado"
  | "cuenta_proveedor_diferente"
  | "correo_social_no_disponible"
  | "inicio_social_cancelado"
  | "proveedor_social_no_disponible"
  | "correo_google_no_disponible"
  | "inicio_google_cancelado"
  | "inicio_google_no_disponible"
  | "perfil_social_no_creado"
  | "usuario_inactivo"
  | "usuario_no_encontrado"
  | "password_debil"
  | "sesion_expirada"
  | "error_red"
  | "error_desconocido";

export class ErrorAuth extends Error {
  readonly codigo: CodigoErrorAuth;

  constructor(codigo: CodigoErrorAuth, mensaje: string) {
    super(mensaje);
    this.name = "ErrorAuth";
    this.codigo = codigo;
  }
}

export const MENSAJES_ERROR: Record<CodigoErrorAuth, string> = {
  credenciales_invalidas: "El correo o la contraseña son incorrectos.",
  email_ya_registrado: "Ya existe una cuenta con este correo electrónico.",
  cuenta_proveedor_diferente:
    "Este correo ya está registrado con otro método de acceso. Inicia sesión con ese método.",
  correo_social_no_disponible:
    "Facebook no compartió tu correo. Autoriza el permiso de correo e intenta de nuevo.",
  inicio_social_cancelado: "Se canceló el inicio de sesión con Facebook.",
  proveedor_social_no_disponible:
    "El acceso con Facebook aún no está disponible. Contacta al hotel.",
  correo_google_no_disponible: "Google no compartió tu correo electrónico.",
  inicio_google_cancelado: "Se canceló el inicio de sesión con Google.",
  inicio_google_no_disponible:
    "El acceso con Google no está disponible en este momento. Intenta de nuevo más tarde.",
  perfil_social_no_creado:
    "No pudimos crear tu perfil de huésped. Intenta de nuevo.",
  usuario_inactivo: "Esta cuenta está desactivada. Contacta al hotel.",
  usuario_no_encontrado: "No encontramos una cuenta con ese correo.",
  password_debil: "La contraseña no cumple con los requisitos mínimos.",
  sesion_expirada: "Tu sesión expiró. Vuelve a iniciar sesión.",
  error_red: "No pudimos conectar con el servidor. Revisa tu conexión.",
  error_desconocido: "Ocurrió un error inesperado. Intenta de nuevo.",
};

/** Contrato del servicio de autenticación. */
export type ServicioAuth = {
  /** Lanza `ErrorAuth` si las credenciales no son válidas. */
  login(credenciales: Credenciales): Promise<Sesion>;

  loginGoogle(): Promise<Sesion>;
  loginFacebook(): Promise<Sesion>;

  registrar(datos: DatosRegistro): Promise<Sesion>;

  logout(): Promise<void>;

  /** `null` si no hay sesión guardada o ya expiró. */
  restaurarSesion(): Promise<Sesion | null>;

  actualizarPerfil(
    usuarioId: string,
    cambios: Partial<Usuario>,
  ): Promise<Usuario>;
};
