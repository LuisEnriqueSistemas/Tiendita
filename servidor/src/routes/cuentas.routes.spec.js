import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { crearApp } from "../../app.js";
import { crearContenedorDePruebas } from "../tests/contenedor-pruebas.js";

const CREDENCIALES = {
  nombre: "Ana Pérez",
  email: "ana@tienda.com",
  password: "ClaveSegura1",
};

describe("API de Gestión de Cuentas", () => {
  let app;
  let contenedor;

  beforeEach(() => {
    contenedor = crearContenedorDePruebas();
    app = crearApp({ contenedor });
  });

  describe("POST /api/auth/registro", () => {
    it("registra la cuenta y responde 201 sin exponer la contraseña", async () => {
      const respuesta = await request(app).post("/api/auth/registro").send(CREDENCIALES);

      expect(respuesta.status).toBe(201);
      expect(respuesta.body.mensaje).toBe("Cuenta registrada correctamente");
      expect(respuesta.body.data).toMatchObject({ nombre: "Ana Pérez", email: "ana@tienda.com" });
      expect(respuesta.body.data).not.toHaveProperty("passwordHash");
    });

    it("responde 400 con el detalle de los campos inválidos", async () => {
      const respuesta = await request(app)
        .post("/api/auth/registro")
        .send({ nombre: "A", email: "correo-invalido", password: "123" });

      expect(respuesta.status).toBe(400);
      expect(respuesta.body.error.codigo).toBe("VALIDACION_FALLIDA");
      expect(respuesta.body.error.detalles.map((d) => d.campo).sort()).toEqual([
        "email",
        "nombre",
        "password",
      ]);
    });

    it("responde 409 cuando el correo ya está registrado", async () => {
      await request(app).post("/api/auth/registro").send(CREDENCIALES);

      const respuesta = await request(app)
        .post("/api/auth/registro")
        .send({ ...CREDENCIALES, nombre: "Otra" });

      expect(respuesta.status).toBe(409);
      expect(respuesta.body.error.codigo).toBe("EMAIL_YA_REGISTRADO");
    });
  });

  describe("POST /api/auth/login", () => {
    beforeEach(async () => {
      await request(app).post("/api/auth/registro").send(CREDENCIALES);
    });

    it("responde 200 con el token de sesión", async () => {
      const respuesta = await request(app)
        .post("/api/auth/login")
        .send({ email: CREDENCIALES.email, password: CREDENCIALES.password });

      expect(respuesta.status).toBe(200);
      expect(respuesta.body.token_type).toBe("Bearer");
      expect(respuesta.body.user.email).toBe(CREDENCIALES.email);
    });

    it("responde 400 con mensaje genérico si la contraseña es incorrecta", async () => {
      const respuesta = await request(app)
        .post("/api/auth/login")
        .send({ email: CREDENCIALES.email, password: "ClaveIncorrecta9" });

      expect(respuesta.status).toBe(400);
      expect(respuesta.body.error.codigo).toBe("CREDENCIALES_INVALIDAS");
      expect(respuesta.body.error.mensaje).toBe("Usuario o contraseña incorrectos");
    });
  });

  describe("Gestión del perfil", () => {
    let token;

    beforeEach(async () => {
      await request(app).post("/api/auth/registro").send(CREDENCIALES);
      const login = await request(app)
        .post("/api/auth/login")
        .send({ email: CREDENCIALES.email, password: CREDENCIALES.password });
      token = login.body.access_token;
    });

    it("responde 401 sin encabezado Authorization", async () => {
      const respuesta = await request(app).get("/api/usuarios/mi-perfil");

      expect(respuesta.status).toBe(401);
      expect(respuesta.body.error.codigo).toBe("NO_AUTENTICADO");
    });

    it("responde 401 con un token inválido", async () => {
      const respuesta = await request(app)
        .get("/api/usuarios/mi-perfil")
        .set("Authorization", "Bearer token.invalido");

      expect(respuesta.status).toBe(401);
      expect(respuesta.body.error.codigo).toBe("TOKEN_AUTENTICACION_INVALIDO");
    });

    it("devuelve el perfil del usuario autenticado", async () => {
      const respuesta = await request(app)
        .get("/api/usuarios/mi-perfil")
        .set("Authorization", `Bearer ${token}`);

      expect(respuesta.status).toBe(200);
      expect(respuesta.body.email).toBe(CREDENCIALES.email);
      expect(respuesta.body).not.toHaveProperty("passwordHash");
    });

    it("actualiza nombre y correo", async () => {
      const respuesta = await request(app)
        .patch("/api/usuarios/mi-perfil")
        .set("Authorization", `Bearer ${token}`)
        .send({ nombre: "Ana María", email: "ana.maria@tienda.com" });

      expect(respuesta.status).toBe(200);
      expect(respuesta.body).toEqual({
        id: respuesta.body.id,
        nombre: "Ana María",
        email: "ana.maria@tienda.com",
      });
    });

    it("responde 400 al actualizar sin ningún campo", async () => {
      const respuesta = await request(app)
        .patch("/api/usuarios/mi-perfil")
        .set("Authorization", `Bearer ${token}`)
        .send({});

      expect(respuesta.status).toBe(400);
      expect(respuesta.body.error.codigo).toBe("VALIDACION_FALLIDA");
    });
  });

  describe("Recuperación de contraseña", () => {
    beforeEach(async () => {
      await request(app).post("/api/auth/registro").send(CREDENCIALES);
    });

    it("responde 202 con el mismo mensaje exista o no el correo", async () => {
      const existente = await request(app)
        .post("/api/auth/recuperar-contrasena")
        .send({ email: CREDENCIALES.email });
      const inexistente = await request(app)
        .post("/api/auth/recuperar-contrasena")
        .send({ email: "nadie@tienda.com" });

      expect(existente.status).toBe(202);
      expect(inexistente.status).toBe(202);
      expect(existente.body.mensaje).toBe(inexistente.body.mensaje);
      expect(contenedor.mailService.envios).toHaveLength(1);
    });

    it("valida el enlace y restablece la contraseña", async () => {
      await request(app).post("/api/auth/recuperar-contrasena").send({ email: CREDENCIALES.email });
      const [envio] = contenedor.mailService.envios;
      const tokenRecuperacion = new URL(envio.enlace).searchParams.get("token");

      const validacion = await request(app)
        .get("/api/auth/validar-token-recuperacion")
        .query({ token: tokenRecuperacion });
      expect(validacion.status).toBe(200);
      expect(validacion.body).toEqual({ valido: true, email: CREDENCIALES.email });

      const restablecimiento = await request(app)
        .post("/api/auth/restablecer-contrasena")
        .send({ token: tokenRecuperacion, password: "NuevaClave2" });
      expect(restablecimiento.status).toBe(200);

      const login = await request(app)
        .post("/api/auth/login")
        .send({ email: CREDENCIALES.email, password: "NuevaClave2" });
      expect(login.status).toBe(200);
    });

    it("responde 400 cuando el enlace ya fue utilizado", async () => {
      await request(app).post("/api/auth/recuperar-contrasena").send({ email: CREDENCIALES.email });
      const [envio] = contenedor.mailService.envios;
      const tokenRecuperacion = new URL(envio.enlace).searchParams.get("token");

      await request(app)
        .post("/api/auth/restablecer-contrasena")
        .send({ token: tokenRecuperacion, password: "NuevaClave2" });

      const repetido = await request(app)
        .post("/api/auth/restablecer-contrasena")
        .send({ token: tokenRecuperacion, password: "OtraClave3" });

      expect(repetido.status).toBe(400);
      expect(repetido.body.error.codigo).toBe("TOKEN_INVALIDO");
    });

    it("responde 400 cuando el token no existe", async () => {
      const respuesta = await request(app)
        .get("/api/auth/validar-token-recuperacion")
        .query({ token: "token-inexistente" });

      expect(respuesta.status).toBe(400);
      expect(respuesta.body.error.codigo).toBe("TOKEN_INVALIDO");
    });
  });

  describe("Flujo completo CU-01 → CU-04", () => {
    it("registra, autentica, actualiza, recupera la clave y elimina la cuenta", async () => {
      const registro = await request(app).post("/api/auth/registro").send(CREDENCIALES);
      expect(registro.status).toBe(201);

      const login = await request(app)
        .post("/api/auth/login")
        .send({ email: CREDENCIALES.email, password: CREDENCIALES.password });
      const { access_token: token } = login.body;

      const perfil = await request(app)
        .get("/api/usuarios/mi-perfil")
        .set("Authorization", `Bearer ${token}`);
      expect(perfil.status).toBe(200);

      const actualizacion = await request(app)
        .patch("/api/usuarios/mi-perfil")
        .set("Authorization", `Bearer ${token}`)
        .send({ nombre: "Ana María" });
      expect(actualizacion.body.nombre).toBe("Ana María");

      await request(app).post("/api/auth/recuperar-contrasena").send({ email: CREDENCIALES.email });
      const [envio] = contenedor.mailService.envios;
      const tokenRecuperacion = new URL(envio.enlace).searchParams.get("token");
      await request(app)
        .post("/api/auth/restablecer-contrasena")
        .send({ token: tokenRecuperacion, password: "NuevaClave2" });

      const loginNuevo = await request(app)
        .post("/api/auth/login")
        .send({ email: CREDENCIALES.email, password: "NuevaClave2" });

      const eliminacion = await request(app)
        .delete("/api/usuarios/mi-perfil")
        .set("Authorization", `Bearer ${loginNuevo.body.access_token}`);
      expect(eliminacion.status).toBe(200);

      const loginTrasBaja = await request(app)
        .post("/api/auth/login")
        .send({ email: CREDENCIALES.email, password: "NuevaClave2" });
      expect(loginTrasBaja.status).toBe(400);
      expect(loginTrasBaja.body.error.codigo).toBe("CREDENCIALES_INVALIDAS");
    });
  });

  describe("Manejo de errores", () => {
    it("responde 404 en rutas inexistentes", async () => {
      const respuesta = await request(app).get("/api/ruta/inexistente");

      expect(respuesta.status).toBe(404);
      expect(respuesta.body.error.codigo).toBe("RUTA_NO_ENCONTRADA");
    });

    it("responde 400 con JSON mal formado", async () => {
      const respuesta = await request(app)
        .post("/api/auth/login")
        .set("Content-Type", "application/json")
        .send("{ no es json");

      expect(respuesta.status).toBe(400);
      expect(respuesta.body.error.codigo).toBe("VALIDACION_FALLIDA");
    });

    it("responde 200 en la ruta de salud", async () => {
      const respuesta = await request(app).get("/api/salud");

      expect(respuesta.status).toBe(200);
      expect(respuesta.body.estado).toBe("ok");
    });
  });
});
