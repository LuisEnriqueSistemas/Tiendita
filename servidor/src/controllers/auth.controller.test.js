import { describe, expect, it, vi } from "vitest";
import { AuthController } from "./auth.controller.js";
import { crearResFalso } from "../tests/http.fake.js";

const crearAuthServiceFalso = () => ({
  registrar: vi.fn(),
  autenticar: vi.fn(),
  solicitarRecuperacion: vi.fn(),
  validarTokenRecuperacion: vi.fn(),
  restablecerContrasena: vi.fn(),
});

describe("AuthController", () => {
  it("registrar responde 201 con el usuario creado", async () => {
    const usuario = { id: 1, nombre: "Ana", email: "ana@tienda.com" };
    const authService = crearAuthServiceFalso();
    authService.registrar.mockResolvedValue(usuario);
    const res = crearResFalso();

    await new AuthController({ authService }).registrar(
      { body: { nombre: "Ana", email: "ana@tienda.com", password: "ClaveSegura1" } },
      res,
    );

    expect(authService.registrar).toHaveBeenCalledWith({
      nombre: "Ana",
      email: "ana@tienda.com",
      password: "ClaveSegura1",
    });
    expect(res.statusCode).toBe(201);
    expect(res.cuerpo).toEqual({ mensaje: "Cuenta registrada correctamente", data: usuario });
  });

  it("login responde 200 con el token de sesión", async () => {
    const sesion = { access_token: "token", token_type: "Bearer", expires_in: 3600, user: {} };
    const authService = crearAuthServiceFalso();
    authService.autenticar.mockResolvedValue(sesion);
    const res = crearResFalso();

    await new AuthController({ authService }).login(
      { body: { email: "ana@tienda.com", password: "ClaveSegura1" } },
      res,
    );

    expect(res.statusCode).toBe(200);
    expect(res.cuerpo).toEqual(sesion);
  });

  it("recuperarContrasena responde 202 con el mensaje genérico", async () => {
    const authService = crearAuthServiceFalso();
    authService.solicitarRecuperacion.mockResolvedValue({ mensaje: "Si el correo está registrado..." });
    const res = crearResFalso();

    await new AuthController({ authService }).recuperarContrasena(
      { body: { email: "ana@tienda.com" } },
      res,
    );

    expect(res.statusCode).toBe(202);
    expect(res.cuerpo).toEqual({ mensaje: "Si el correo está registrado..." });
  });

  it("validarTokenRecuperacion toma el token de req.query", async () => {
    const authService = crearAuthServiceFalso();
    authService.validarTokenRecuperacion.mockResolvedValue({ valido: true, email: "ana@tienda.com" });
    const res = crearResFalso();

    await new AuthController({ authService }).validarTokenRecuperacion({ query: { token: "abc" } }, res);

    expect(authService.validarTokenRecuperacion).toHaveBeenCalledWith("abc");
    expect(res.cuerpo).toEqual({ valido: true, email: "ana@tienda.com" });
  });

  it("restablecerContrasena propaga el error del servicio sin responder", async () => {
    const authService = crearAuthServiceFalso();
    authService.restablecerContrasena.mockRejectedValue(new Error("token inválido"));
    const res = crearResFalso();

    await expect(
      new AuthController({ authService }).restablecerContrasena({ body: {} }, res),
    ).rejects.toThrow("token inválido");
    expect(res.cuerpo).toBeUndefined();
  });
});
