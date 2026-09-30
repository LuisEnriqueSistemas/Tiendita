import { describe, expect, it } from "vitest";
import { crearContenedorDePruebas, registrarUsuario } from "../tests/contenedor-pruebas.js";

const PASSWORD_VALIDA = "ClaveSegura1";

describe("UsuarioService", () => {
  describe("consultar perfil", () => {
    it("devuelve los datos públicos del usuario autenticado", async () => {
      const contenedor = crearContenedorDePruebas();
      const usuario = await registrarUsuario(contenedor, { email: "ana@tienda.com" });

      const perfil = await contenedor.usuarioService.obtenerPerfil(usuario.id);

      expect(perfil).toMatchObject({ id: usuario.id, nombre: usuario.nombre, email: usuario.email });
      expect(perfil).not.toHaveProperty("passwordHash");
      expect(perfil).not.toHaveProperty("resetToken");
    });

    it("devuelve 404 si el usuario no existe", async () => {
      const contenedor = crearContenedorDePruebas();

      await expect(contenedor.usuarioService.obtenerPerfil(999)).rejects.toMatchObject({
        status: 404,
        codigo: "USUARIO_NO_ENCONTRADO",
      });
    });

    it("devuelve 404 si la cuenta está dada de baja", async () => {
      const contenedor = crearContenedorDePruebas();
      const usuario = await registrarUsuario(contenedor, { activo: false });

      await expect(contenedor.usuarioService.obtenerPerfil(usuario.id)).rejects.toMatchObject({
        status: 404,
      });
    });
  });

  describe("actualizar perfil", () => {
    it("actualiza el nombre y normaliza el correo", async () => {
      const contenedor = crearContenedorDePruebas();
      const usuario = await registrarUsuario(contenedor, { email: "ana@tienda.com" });

      const resultado = await contenedor.usuarioService.actualizarPerfil(usuario.id, {
        nombre: "  Ana María  ",
        email: "  ANA.NUEVA@TIENDA.COM ",
      });

      expect(resultado).toEqual({ id: usuario.id, nombre: "Ana María", email: "ana.nueva@tienda.com" });
    });

    it("recifra la contraseña cuando se modifica", async () => {
      const contenedor = crearContenedorDePruebas();
      const usuario = await registrarUsuario(contenedor, { email: "ana@tienda.com" });

      await contenedor.usuarioService.actualizarPerfil(usuario.id, { password: "NuevaClave2" });

      const persistido = await contenedor.usuarioRepository.buscarPorId(usuario.id);
      expect(persistido.passwordHash).not.toBe("NuevaClave2");
      expect(await contenedor.hashService.compare("NuevaClave2", persistido.passwordHash)).toBe(true);
    });

    it("permite conservar el propio correo sin responder 409", async () => {
      const contenedor = crearContenedorDePruebas();
      const usuario = await registrarUsuario(contenedor, { email: "ana@tienda.com" });

      const resultado = await contenedor.usuarioService.actualizarPerfil(usuario.id, {
        email: "ANA@tienda.com",
      });

      expect(resultado.email).toBe("ana@tienda.com");
    });

    it("rechaza con 409 cuando el correo pertenece a otra cuenta", async () => {
      const contenedor = crearContenedorDePruebas();
      await registrarUsuario(contenedor, { email: "ana@tienda.com" });
      const otro = await registrarUsuario(contenedor, { email: "luis@tienda.com" });

      await expect(
        contenedor.usuarioService.actualizarPerfil(otro.id, { email: "ana@tienda.com" }),
      ).rejects.toMatchObject({ status: 409, codigo: "EMAIL_YA_REGISTRADO" });
    });

    it("rechaza con 404 si la cuenta está dada de baja", async () => {
      const contenedor = crearContenedorDePruebas();
      const usuario = await registrarUsuario(contenedor, { activo: false });

      await expect(
        contenedor.usuarioService.actualizarPerfil(usuario.id, { nombre: "Ana" }),
      ).rejects.toMatchObject({ status: 404 });
    });
  });

  describe("eliminar cuenta", () => {
    it("realiza la baja lógica y conserva el registro", async () => {
      const contenedor = crearContenedorDePruebas();
      const usuario = await registrarUsuario(contenedor, { email: "ana@tienda.com" });

      const { mensaje } = await contenedor.usuarioService.eliminarCuenta(usuario.id);

      expect(mensaje).toMatch(/eliminada correctamente/);
      const persistido = await contenedor.usuarioRepository.buscarPorId(usuario.id);
      expect(persistido.activo).toBe(false);
      expect(persistido.eliminadoEn).toBeInstanceOf(Date);
    });

    it("impide iniciar sesión después de la baja", async () => {
      const contenedor = crearContenedorDePruebas();
      const usuario = await registrarUsuario(contenedor, { email: "ana@tienda.com" });
      await contenedor.usuarioService.eliminarCuenta(usuario.id);

      await expect(
        contenedor.authService.autenticar({ email: "ana@tienda.com", password: PASSWORD_VALIDA }),
      ).rejects.toMatchObject({ codigo: "CREDENCIALES_INVALIDAS" });
    });

    it("invalida el token de recuperación pendiente", async () => {
      const contenedor = crearContenedorDePruebas();
      const usuario = await registrarUsuario(contenedor, { email: "ana@tienda.com" });
      await contenedor.authService.solicitarRecuperacion({ email: "ana@tienda.com" });
      const [envio] = contenedor.mailService.envios;

      await contenedor.usuarioService.eliminarCuenta(usuario.id);

      await expect(
        contenedor.authService.restablecerContrasena({
          token: new URL(envio.enlace).searchParams.get("token"),
          password: "NuevaClave2",
        }),
      ).rejects.toMatchObject({ status: 400, codigo: "TOKEN_INVALIDO" });
    });

    it("devuelve 404 si la cuenta ya fue eliminada", async () => {
      const contenedor = crearContenedorDePruebas();
      const usuario = await registrarUsuario(contenedor, { activo: false });

      await expect(contenedor.usuarioService.eliminarCuenta(usuario.id)).rejects.toMatchObject({
        status: 404,
      });
    });
  });
});
