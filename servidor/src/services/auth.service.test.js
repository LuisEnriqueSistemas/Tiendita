import { describe, expect, it } from "vitest";
import { crearContenedorDePruebas, registrarUsuario } from "../tests/contenedor-pruebas.js";

const PASSWORD_VALIDA = "ClaveSegura1";

describe("AuthService", () => {
  describe("CU-01 registrar", () => {
    it("crea la cuenta con el correo normalizado y la contraseña cifrada", async () => {
      const contenedor = crearContenedorDePruebas();

      const resultado = await contenedor.authService.registrar({
        nombre: "  Ana Pérez  ",
        email: "  ANA@Tienda.COM ",
        password: PASSWORD_VALIDA,
      });

      expect(resultado.nombre).toBe("Ana Pérez");
      expect(resultado.email).toBe("ana@tienda.com");
      expect(resultado).not.toHaveProperty("passwordHash");

      const persistido = await contenedor.usuarioRepository.buscarPorEmail("ana@tienda.com");
      expect(persistido.passwordHash).not.toBe(PASSWORD_VALIDA);
      expect(await contenedor.hashService.compare(PASSWORD_VALIDA, persistido.passwordHash)).toBe(true);
    });

    it("rechaza con 409 cuando el correo ya está registrado", async () => {
      const contenedor = crearContenedorDePruebas();
      await registrarUsuario(contenedor, { email: "ana@tienda.com" });

      const promesa = contenedor.authService.registrar({
        nombre: "Ana",
        email: "ANA@tienda.com",
        password: PASSWORD_VALIDA,
      });

      await expect(promesa).rejects.toMatchObject({ status: 409, codigo: "EMAIL_YA_REGISTRADO" });
    });

    it("rechaza con 409 aunque la cuenta previa esté dada de baja (baja lógica)", async () => {
      const contenedor = crearContenedorDePruebas();
      await registrarUsuario(contenedor, { email: "ana@tienda.com", activo: false });

      await expect(
        contenedor.authService.registrar({
          nombre: "Ana",
          email: "ana@tienda.com",
          password: PASSWORD_VALIDA,
        }),
      ).rejects.toMatchObject({ status: 409 });
    });
  });

  describe("CU-02 autenticar", () => {
    it("devuelve el token de sesión y los datos públicos del usuario", async () => {
      const contenedor = crearContenedorDePruebas();
      const usuario = await registrarUsuario(contenedor, { email: "ana@tienda.com" });

      const resultado = await contenedor.authService.autenticar({
        email: "ANA@tienda.com",
        password: PASSWORD_VALIDA,
      });

      expect(resultado.token_type).toBe("Bearer");
      expect(resultado.expires_in).toBe(3600);
      expect(resultado.user).toEqual({ id: usuario.id, nombre: usuario.nombre, email: usuario.email });
      expect(resultado).not.toHaveProperty("passwordHash");

      const sesion = contenedor.jwtService.verificarSesion(resultado.access_token);
      expect(sesion).toEqual({ userId: usuario.id, email: "ana@tienda.com" });
    });

    it("rechaza con el mismo mensaje si el correo no existe", async () => {
      const contenedor = crearContenedorDePruebas();

      await expect(
        contenedor.authService.autenticar({ email: "nadie@tienda.com", password: PASSWORD_VALIDA }),
      ).rejects.toMatchObject({
        status: 400,
        codigo: "CREDENCIALES_INVALIDAS",
        message: "Usuario o contraseña incorrectos",
      });
    });

    it("rechaza con el mismo mensaje si la contraseña es incorrecta", async () => {
      const contenedor = crearContenedorDePruebas();
      await registrarUsuario(contenedor, { email: "ana@tienda.com" });

      await expect(
        contenedor.authService.autenticar({ email: "ana@tienda.com", password: "OtraClave9" }),
      ).rejects.toMatchObject({ status: 400, message: "Usuario o contraseña incorrectos" });
    });

    it("rechaza con el mismo mensaje si la cuenta está dada de baja", async () => {
      const contenedor = crearContenedorDePruebas();
      await registrarUsuario(contenedor, { email: "ana@tienda.com", activo: false });

      await expect(
        contenedor.authService.autenticar({ email: "ana@tienda.com", password: PASSWORD_VALIDA }),
      ).rejects.toMatchObject({ status: 400, message: "Usuario o contraseña incorrectos" });
    });
  });

  describe("CU-03 solicitar recuperación", () => {
    it("genera, persiste y envía el enlace de recuperación", async () => {
      const contenedor = crearContenedorDePruebas();
      const usuario = await registrarUsuario(contenedor, { email: "ana@tienda.com" });

      const { mensaje } = await contenedor.authService.solicitarRecuperacion({
        email: "ANA@tienda.com",
      });

      expect(mensaje).toMatch(/Si el correo está registrado/);
      expect(contenedor.mailService.envios).toHaveLength(1);

      const [envio] = contenedor.mailService.envios;
      expect(envio.email).toBe("ana@tienda.com");
      expect(envio.nombre).toBe(usuario.nombre);
      expect(envio.enlace).toContain("/restablecer-contrasena?token=");

      const persistido = await contenedor.usuarioRepository.buscarPorId(usuario.id);
      expect(persistido.resetToken).toBeTruthy();
      expect(persistido.resetTokenExpiresAt.getTime()).toBeGreaterThan(Date.now());
    });

    it("responde de forma genérica y no envía correo si el correo no existe", async () => {
      const contenedor = crearContenedorDePruebas();

      const resultado = await contenedor.authService.solicitarRecuperacion({
        email: "nadie@tienda.com",
      });

      expect(resultado.mensaje).toMatch(/Si el correo está registrado/);
      expect(contenedor.mailService.envios).toHaveLength(0);
    });

    it("responde de forma genérica si la cuenta está dada de baja", async () => {
      const contenedor = crearContenedorDePruebas();
      await registrarUsuario(contenedor, { email: "ana@tienda.com", activo: false });

      await contenedor.authService.solicitarRecuperacion({ email: "ana@tienda.com" });

      expect(contenedor.mailService.envios).toHaveLength(0);
    });

    it("invalida el token si el envío de correo falla", async () => {
      const contenedor = crearContenedorDePruebas();
      const usuario = await registrarUsuario(contenedor, { email: "ana@tienda.com" });
      contenedor.mailService.fallar = true;

      const resultado = await contenedor.authService.solicitarRecuperacion({
        email: "ana@tienda.com",
      });

      expect(resultado.mensaje).toMatch(/Si el correo está registrado/);
      const persistido = await contenedor.usuarioRepository.buscarPorId(usuario.id);
      expect(persistido.resetToken).toBeNull();
    });
  });

  describe("CU-03 restablecer contraseña", () => {
    const ejecutarRecuperacion = async (contenedor, email) => {
      await contenedor.authService.solicitarRecuperacion({ email });
      const [envio] = contenedor.mailService.envios;
      return new URL(envio.enlace).searchParams.get("token");
    };

    it("valida el enlace activo", async () => {
      const contenedor = crearContenedorDePruebas();
      await registrarUsuario(contenedor, { email: "ana@tienda.com" });
      const token = await ejecutarRecuperacion(contenedor, "ana@tienda.com");

      const resultado = await contenedor.authService.validarTokenRecuperacion(token);

      expect(resultado).toEqual({ valido: true, email: "ana@tienda.com" });
    });

    it("actualiza la contraseña cifrada y consume el token", async () => {
      const contenedor = crearContenedorDePruebas();
      const usuario = await registrarUsuario(contenedor, { email: "ana@tienda.com" });
      const token = await ejecutarRecuperacion(contenedor, "ana@tienda.com");

      const { mensaje } = await contenedor.authService.restablecerContrasena({
        token,
        password: "NuevaClave2",
      });

      expect(mensaje).toMatch(/actualizada correctamente/);
      const persistido = await contenedor.usuarioRepository.buscarPorId(usuario.id);
      expect(await contenedor.hashService.compare("NuevaClave2", persistido.passwordHash)).toBe(true);
      expect(persistido.resetToken).toBeNull();
    });

    it("permite iniciar sesión con la nueva contraseña y no con la anterior", async () => {
      const contenedor = crearContenedorDePruebas();
      await registrarUsuario(contenedor, { email: "ana@tienda.com" });
      const token = await ejecutarRecuperacion(contenedor, "ana@tienda.com");
      await contenedor.authService.restablecerContrasena({ token, password: "NuevaClave2" });

      await expect(
        contenedor.authService.autenticar({ email: "ana@tienda.com", password: PASSWORD_VALIDA }),
      ).rejects.toMatchObject({ codigo: "CREDENCIALES_INVALIDAS" });

      const sesion = await contenedor.authService.autenticar({
        email: "ana@tienda.com",
        password: "NuevaClave2",
      });
      expect(sesion.access_token).toBeTruthy();
    });

    it("rechaza un token ya utilizado (de un solo uso)", async () => {
      const contenedor = crearContenedorDePruebas();
      await registrarUsuario(contenedor, { email: "ana@tienda.com" });
      const token = await ejecutarRecuperacion(contenedor, "ana@tienda.com");
      await contenedor.authService.restablecerContrasena({ token, password: "NuevaClave2" });

      await expect(
        contenedor.authService.restablecerContrasena({ token, password: "OtraClave3" }),
      ).rejects.toMatchObject({ status: 400, codigo: "TOKEN_INVALIDO" });
    });

    it("rechaza un token con firma inválida", async () => {
      const contenedor = crearContenedorDePruebas();
      await registrarUsuario(contenedor, { email: "ana@tienda.com" });

      await expect(
        contenedor.authService.restablecerContrasena({ token: "token-falso", password: "NuevaClave2" }),
      ).rejects.toMatchObject({ status: 400, codigo: "TOKEN_INVALIDO" });
    });

    it("rechaza un enlace caducado (E2)", async () => {
      const contenedor = crearContenedorDePruebas();
      const usuario = await registrarUsuario(contenedor, { email: "ana@tienda.com" });
      const token = await ejecutarRecuperacion(contenedor, "ana@tienda.com");
      await contenedor.usuarioRepository.guardarResetToken(usuario.id, {
        token,
        expiraEn: new Date(Date.now() - 1000),
      });

      await expect(
        contenedor.authService.validarTokenRecuperacion(token),
      ).rejects.toMatchObject({ status: 400, codigo: "TOKEN_INVALIDO" });
    });

    it("rechaza un token de sesión usado como enlace de recuperación", async () => {
      const contenedor = crearContenedorDePruebas();
      const usuario = await registrarUsuario(contenedor, { email: "ana@tienda.com" });
      const sesion = await contenedor.authService.autenticar({
        email: "ana@tienda.com",
        password: PASSWORD_VALIDA,
      });

      await expect(
        contenedor.authService.restablecerContrasena({
          token: sesion.access_token,
          password: "NuevaClave2",
        }),
      ).rejects.toMatchObject({ status: 400, codigo: "TOKEN_INVALIDO" });
    });
  });
});
