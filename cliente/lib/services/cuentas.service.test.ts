import { afterEach, describe, expect, it, vi } from "vitest";
import * as authService from "@/lib/services/auth.service";
import * as usuarioService from "@/lib/services/usuario.service";

const espiarFetch = (cuerpo: unknown = {}, init: { ok?: boolean; status?: number } = {}) => {
  const mock = vi.fn().mockResolvedValue({
    ok: init.ok ?? true,
    status: init.status ?? 200,
    text: async () => JSON.stringify(cuerpo),
  });
  vi.stubGlobal("fetch", mock);
  return mock;
};

const ultimaPeticion = (mock: ReturnType<typeof espiarFetch>) => {
  const [url, opciones] = mock.mock.calls[0];
  return { url: String(url), metodo: opciones.method, cuerpo: opciones.body };
};

describe("auth.service", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("registra la cuenta con POST /auth/registro", async () => {
    const mock = espiarFetch({ mensaje: "ok" });

    await authService.registrar({ nombre: "Ana", email: "ana@tienda.com", password: "ClaveSegura1" });

    expect(ultimaPeticion(mock).url).toContain("/auth/registro");
    expect(ultimaPeticion(mock).metodo).toBe("POST");
    expect(JSON.parse(ultimaPeticion(mock).cuerpo)).toEqual({
      nombre: "Ana",
      email: "ana@tienda.com",
      password: "ClaveSegura1",
    });
  });

  it("inicia sesión con POST /auth/login", async () => {
    const mock = espiarFetch({ access_token: "abc", token_type: "Bearer", expires_in: 3600, user: {} });

    const sesion = await authService.iniciarSesion({
      email: "ana@tienda.com",
      password: "ClaveSegura1",
    });

    expect(ultimaPeticion(mock).url).toContain("/auth/login");
    expect(sesion.access_token).toBe("abc");
  });

  it("solicita la recuperación con POST /auth/recuperar-contrasena", async () => {
    const mock = espiarFetch({ mensaje: "procesada" });

    const respuesta = await authService.solicitarRecuperacion({ email: "ana@tienda.com" });

    expect(ultimaPeticion(mock).url).toContain("/auth/recuperar-contrasena");
    expect(respuesta.mensaje).toBe("procesada");
  });

  it("valida el token enviando el parámetro codificado en la URL", async () => {
    const mock = espiarFetch({ valido: true, email: "ana@tienda.com" });

    await authService.validarTokenRecuperacion("token con espacio");

    expect(ultimaPeticion(mock).url).toContain(
      "/auth/validar-token-recuperacion?token=token%20con%20espacio",
    );
  });

  it("restablece la contraseña con POST /auth/restablecer-contrasena", async () => {
    const mock = espiarFetch({ mensaje: "actualizada" });

    await authService.restablecerContrasena({ token: "abc", password: "NuevaClave2" });

    expect(ultimaPeticion(mock).url).toContain("/auth/restablecer-contrasena");
  });
});

describe("usuario.service", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("obtiene el perfil con GET y el token de sesión", async () => {
    const mock = espiarFetch({ id: 1, nombre: "Ana", email: "ana@tienda.com" });

    const perfil = await usuarioService.obtenerPerfil("token-abc");

    expect(ultimaPeticion(mock).url).toContain("/usuarios/mi-perfil");
    expect(ultimaPeticion(mock).metodo).toBe("GET");
    expect(perfil.email).toBe("ana@tienda.com");
  });

  it("actualiza el perfil con PATCH", async () => {
    const mock = espiarFetch({ id: 1, nombre: "Ana María", email: "ana@tienda.com" });

    await usuarioService.actualizarPerfil("token-abc", { nombre: "Ana María" });

    expect(ultimaPeticion(mock).metodo).toBe("PATCH");
    expect(JSON.parse(ultimaPeticion(mock).cuerpo)).toEqual({ nombre: "Ana María" });
  });

  it("elimina la cuenta con DELETE", async () => {
    const mock = espiarFetch({ mensaje: "eliminada" });

    const respuesta = await usuarioService.eliminarCuenta("token-abc");

    expect(ultimaPeticion(mock).metodo).toBe("DELETE");
    expect(respuesta.mensaje).toBe("eliminada");
  });
});
