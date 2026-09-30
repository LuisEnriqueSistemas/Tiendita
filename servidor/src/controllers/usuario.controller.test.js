import { describe, expect, it, vi } from "vitest";
import { UsuarioController } from "./usuario.controller.js";
import { crearResFalso } from "../tests/http.fake.js";

const crearUsuarioServiceFalso = () => ({
  obtenerPerfil: vi.fn(),
  actualizarPerfil: vi.fn(),
  eliminarCuenta: vi.fn(),
});

describe("UsuarioController", () => {
  it("obtenerPerfil usa el id de la sesión y no el de la petición", async () => {
    const usuarioService = crearUsuarioServiceFalso();
    usuarioService.obtenerPerfil.mockResolvedValue({ id: 7, nombre: "Ana", email: "ana@tienda.com" });
    const res = crearResFalso();

    await new UsuarioController({ usuarioService }).obtenerPerfil({ usuario: { id: 7 } }, res);

    expect(usuarioService.obtenerPerfil).toHaveBeenCalledWith(7);
    expect(res.statusCode).toBe(200);
    expect(res.cuerpo).toEqual({ id: 7, nombre: "Ana", email: "ana@tienda.com" });
  });

  it("actualizarPerfil delega el cuerpo y el id de la sesión", async () => {
    const usuarioService = crearUsuarioServiceFalso();
    usuarioService.actualizarPerfil.mockResolvedValue({ id: 7, nombre: "Ana", email: "nuevo@tienda.com" });
    const res = crearResFalso();

    await new UsuarioController({ usuarioService }).actualizarPerfil(
      { usuario: { id: 7 }, body: { email: "nuevo@tienda.com" } },
      res,
    );

    expect(usuarioService.actualizarPerfil).toHaveBeenCalledWith(7, { email: "nuevo@tienda.com" });
    expect(res.statusCode).toBe(200);
    expect(res.cuerpo).toEqual({ id: 7, nombre: "Ana", email: "nuevo@tienda.com" });
  });

  it("eliminarCuenta responde 200 con el mensaje de confirmación", async () => {
    const usuarioService = crearUsuarioServiceFalso();
    usuarioService.eliminarCuenta.mockResolvedValue({ mensaje: "Tu cuenta fue eliminada correctamente" });
    const res = crearResFalso();

    await new UsuarioController({ usuarioService }).eliminarCuenta({ usuario: { id: 7 } }, res);

    expect(usuarioService.eliminarCuenta).toHaveBeenCalledWith(7);
    expect(res.statusCode).toBe(200);
    expect(res.cuerpo).toEqual({ mensaje: "Tu cuenta fue eliminada correctamente" });
  });
});
