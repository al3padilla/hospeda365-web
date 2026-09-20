/**
 * Pruebas funcionales del módulo de autenticación.
 *
 * Cubre: validadores de formularios, reducer del estado global y
 * el servicio mock (login, registro, sesión, permisos).
 *
 * CÓMO EJECUTARLAS:
 *
 *     npx tsx scripts/pruebas-auth.ts
 *
 * No requiere jest ni vitest: `tsx` ejecuta TypeScript directamente.
 * Si el equipo adopta un runner después, estas pruebas se migran casi
 * sin cambios (sólo envolver cada `prueba()` en `it()`).
 */

import assert from "node:assert/strict";

import {
  authReducer,
  estadoInicial,
  esPersonal,
  estaAutenticado,
  iniciales,
  nombreCompleto,
  type AuthState,
} from "../contexto/authReducer.ts";
import {
  validarLogin,
  validarRegistro,
  sinErrores,
  fuerzaPassword,
  requisitosFaltantes,
} from "../validacion/auth.ts";
import { authMock } from "../servicios/authMock.ts";
import { ErrorAuth, type Sesion } from "../servicios/tiposAuth.ts";

let pasadas = 0;
let fallidas = 0;

function prueba(nombre: string, fn: () => void | Promise<void>): Promise<void> {
  return Promise.resolve()
    .then(fn)
    .then(() => {
      pasadas++;
      console.log(`  ✅ ${nombre}`);
    })
    .catch((e: Error) => {
      fallidas++;
      console.log(`  ❌ ${nombre}`);
      console.log(`     ${e.message.split("\n")[0]}`);
    });
}

async function main() {
  // =========================================================================
  console.log("\n── VALIDADORES ──");
  // =========================================================================

  await prueba("login: rechaza email y contraseña vacíos", () => {
    const e = validarLogin({ email: "", password: "" });
    assert.ok(e.email);
    assert.ok(e.password);
    assert.equal(sinErrores(e), false);
  });

  await prueba("login: rechaza emails mal formados", () => {
    assert.ok(validarLogin({ email: "jason@", password: "x" }).email);
    assert.ok(validarLogin({ email: "jason.com", password: "x" }).email);
    assert.ok(validarLogin({ email: "a@b.c", password: "x" }).email);
  });

  await prueba("login: acepta credenciales bien formadas", () => {
    const e = validarLogin({ email: "jason@example.com", password: "Jason123" });
    assert.equal(sinErrores(e), true);
  });

  await prueba("registro: detecta contraseñas que no coinciden", () => {
    const e = validarRegistro({
      nombre: "Jason",
      apellido: "Sosa",
      email: "j@example.com",
      telefono: "7123 4567",
      password: "Passw0rd",
      confirmPassword: "Passw0rdX",
    });
    assert.ok(e.confirmPassword);
  });

  await prueba("registro: exige mayúscula, minúscula, número y 8 caracteres", () => {
    assert.deepEqual(requisitosFaltantes("abc"), [
      "al menos 8 caracteres",
      "una letra mayúscula",
      "un número",
    ]);
    assert.deepEqual(requisitosFaltantes("Passw0rd"), []);
  });

  await prueba("registro: valida teléfono salvadoreño (+503, 8 dígitos)", () => {
    const base = {
      nombre: "Jason",
      apellido: "Sosa",
      email: "j@example.com",
      password: "Passw0rd",
      confirmPassword: "Passw0rd",
    };
    assert.equal(sinErrores(validarRegistro({ ...base, telefono: "7123 4567" })), true);
    assert.equal(
      sinErrores(validarRegistro({ ...base, telefono: "+503 7123 4567" })),
      true,
    );
    assert.equal(sinErrores(validarRegistro({ ...base, telefono: "123" })), false);
  });

  await prueba("fuerza de contraseña: escala 0→3 correctamente", () => {
    assert.equal(fuerzaPassword(""), 0);
    assert.equal(fuerzaPassword("abc"), 1);
    assert.equal(fuerzaPassword("Abcdefgh"), 2);
    assert.equal(fuerzaPassword("Abcdefg1"), 2);
    assert.equal(fuerzaPassword("Abcdefghijk1"), 3);
  });

  // =========================================================================
  console.log("\n── REDUCER (estado global) ──");
  // =========================================================================

  const sesionFalsa: Sesion = {
    usuario: {
      id: "usr_1",
      email: "a@b.com",
      nombre: "Ana",
      apellido: "Ruiz",
      telefono: null,
      rol: "admin",
      activo: true,
      creadoEn: "2026-01-01T00:00:00.000Z",
    },
    token: "tok_123",
    expiraEn: "2099-01-01T00:00:00.000Z",
  };

  await prueba('estado inicial es "inicializando"', () => {
    assert.equal(estadoInicial.estado, "inicializando");
    assert.equal(estaAutenticado(estadoInicial), false);
  });

  await prueba("RESTAURAR_SESION con null → no_autenticado", () => {
    const s = authReducer(estadoInicial, { type: "RESTAURAR_SESION", payload: null });
    assert.equal(s.estado, "no_autenticado");
    assert.equal(s.usuario, null);
  });

  await prueba("RESTAURAR_SESION con sesión → autenticado", () => {
    const s = authReducer(estadoInicial, {
      type: "RESTAURAR_SESION",
      payload: sesionFalsa,
    });
    assert.equal(s.estado, "autenticado");
    assert.equal(s.usuario?.nombre, "Ana");
    assert.equal(estaAutenticado(s), true);
  });

  await prueba("OPERACION_INICIADA limpia el error anterior", () => {
    const conError: AuthState = {
      ...estadoInicial,
      estado: "no_autenticado",
      error: { codigo: "credenciales_invalidas", mensaje: "mal" },
    };
    const s = authReducer(conError, { type: "OPERACION_INICIADA" });
    assert.equal(s.estado, "cargando");
    assert.equal(s.error, null);
  });

  await prueba("AUTENTICACION_FALLIDA no deja usuario ni token colgando", () => {
    const auth = authReducer(estadoInicial, {
      type: "RESTAURAR_SESION",
      payload: sesionFalsa,
    });
    const s = authReducer(auth, {
      type: "AUTENTICACION_FALLIDA",
      payload: { codigo: "credenciales_invalidas", mensaje: "mal" },
    });
    assert.equal(s.usuario, null);
    assert.equal(s.token, null);
    assert.equal(s.estado, "no_autenticado");
  });

  await prueba("SESION_CERRADA borra todo el estado", () => {
    const auth = authReducer(estadoInicial, {
      type: "RESTAURAR_SESION",
      payload: sesionFalsa,
    });
    const s = authReducer(auth, { type: "SESION_CERRADA" });
    assert.equal(s.usuario, null);
    assert.equal(estaAutenticado(s), false);
  });

  await prueba("PERFIL_ACTUALIZADO se ignora si no hay sesión", () => {
    const s = authReducer(estadoInicial, {
      type: "PERFIL_ACTUALIZADO",
      payload: sesionFalsa.usuario,
    });
    assert.equal(s.usuario, null, "no debe crear sesión de la nada");
  });

  await prueba("el reducer es puro (no muta el estado anterior)", () => {
    const antes = { ...estadoInicial };
    authReducer(estadoInicial, { type: "RESTAURAR_SESION", payload: sesionFalsa });
    assert.deepEqual(estadoInicial, antes);
  });

  await prueba("selectores: esPersonal, nombreCompleto e iniciales", () => {
    const s = authReducer(estadoInicial, {
      type: "RESTAURAR_SESION",
      payload: sesionFalsa,
    });
    assert.equal(esPersonal(s), true);
    assert.equal(nombreCompleto(s), "Ana Ruiz");
    assert.equal(iniciales(s), "AR");
    assert.equal(nombreCompleto(estadoInicial), "");
  });

  // =========================================================================
  console.log("\n── SERVICIO MOCK ──");
  // =========================================================================

  await prueba("login correcto devuelve sesión sin exponer la contraseña", async () => {
    const s = await authMock.login({
      email: "admin@hospeda365.com",
      password: "Admin123",
    });
    assert.equal(s.usuario.email, "admin@hospeda365.com");
    assert.equal(s.usuario.rol, "admin");
    assert.ok(s.token.length > 0);
    assert.equal(
      "password" in s.usuario,
      false,
      "¡la contraseña NO debe viajar al cliente!",
    );
  });

  await prueba("login es insensible a mayúsculas y espacios en el email", async () => {
    const s = await authMock.login({
      email: "  ADMIN@Hospeda365.com  ",
      password: "Admin123",
    });
    assert.equal(s.usuario.rol, "admin");
  });

  await prueba("contraseña incorrecta lanza credenciales_invalidas", async () => {
    await assert.rejects(
      () => authMock.login({ email: "admin@hospeda365.com", password: "mala" }),
      (e: ErrorAuth) => e.codigo === "credenciales_invalidas",
    );
  });

  await prueba(
    "usuario inexistente da el MISMO error (no filtra qué correos existen)",
    async () => {
      await assert.rejects(
        () => authMock.login({ email: "nadie@x.com", password: "x" }),
        (e: ErrorAuth) => e.codigo === "credenciales_invalidas",
      );
    },
  );

  await prueba("cuenta desactivada lanza usuario_inactivo", async () => {
    await assert.rejects(
      () => authMock.login({ email: "inactivo@example.com", password: "Inactivo123" }),
      (e: ErrorAuth) => e.codigo === "usuario_inactivo",
    );
  });

  await prueba(
    'registro crea rol "huesped" (no se puede auto-asignar admin)',
    async () => {
      const s = await authMock.registrar({
        nombre: "Nuevo",
        apellido: "Usuario",
        email: "nuevo@test.com",
        telefono: "7000 0000",
        password: "Passw0rd",
        confirmPassword: "Passw0rd",
      });
      assert.equal(s.usuario.rol, "huesped");
      assert.equal(s.usuario.activo, true);
    },
  );

  await prueba("el usuario registrado puede iniciar sesión después", async () => {
    const s = await authMock.login({ email: "nuevo@test.com", password: "Passw0rd" });
    assert.equal(s.usuario.nombre, "Nuevo");
  });

  await prueba("email duplicado lanza email_ya_registrado", async () => {
    await assert.rejects(
      () =>
        authMock.registrar({
          nombre: "Otro",
          apellido: "Mas",
          email: "nuevo@test.com",
          telefono: "7000 0001",
          password: "Passw0rd",
          confirmPassword: "Passw0rd",
        }),
      (e: ErrorAuth) => e.codigo === "email_ya_registrado",
    );
  });

  await prueba("actualizarPerfil no permite cambiar el rol ni el email", async () => {
    const s = await authMock.login({
      email: "jason@example.com",
      password: "Jason123",
    });
    const u = await authMock.actualizarPerfil(s.usuario.id, {
      nombre: "Jason Editado",
      rol: "admin",
      email: "hacker@evil.com",
    });
    assert.equal(u.nombre, "Jason Editado", "el nombre SÍ debe cambiar");
    assert.equal(u.rol, "huesped", "¡el rol NO debe cambiar!");
    assert.equal(u.email, "jason@example.com", "¡el email NO debe cambiar!");
  });

  await prueba("actualizarPerfil con id inexistente lanza error", async () => {
    await assert.rejects(
      () => authMock.actualizarPerfil("usr_fantasma", { nombre: "X" }),
      (e: ErrorAuth) => e.codigo === "usuario_no_encontrado",
    );
  });

  // =========================================================================
  console.log(`\n${"═".repeat(50)}`);
  console.log(`RESULTADO: ${pasadas} pasadas, ${fallidas} fallidas`);
  console.log("═".repeat(50));
  process.exit(fallidas > 0 ? 1 : 0);
}

void main();
