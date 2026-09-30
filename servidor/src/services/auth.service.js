import { CODIGO_ERROR } from "../constants/codigos-error.js";
import { ApiError } from "../utils/ApiError.util.js";
import { duracionASegundos } from "../utils/duracion.util.js";

export const MENSAJE_CREDENCIALES_INVALIDAS = "Usuario o contraseña incorrectos";
export const MENSAJE_SOLICITUD_PROCESADA =
  "Si el correo está registrado, recibirás un enlace para restablecer tu contraseña.";

/**
 * Normaliza el correo para persistirlo y compararlo de forma consistente.
 * @param {string} email
 * @returns {string}
 */
export const normalizarEmail = (email) => String(email).trim().toLowerCase();

const credencialesInvalidas = () =>
  ApiError.badRequest(MENSAJE_CREDENCIALES_INVALIDAS, [], CODIGO_ERROR.CREDENCIALES_INVALIDAS);

const tokenInvalido = (mensaje = "El enlace de recuperación es inválido o ha caducado") =>
  ApiError.badRequest(mensaje, [], CODIGO_ERROR.TOKEN_INVALIDO);

const aPerfilPublico = (usuario) => ({
  id: usuario.id,
  nombre: usuario.nombre,
  email: usuario.email,
  creadoEn: usuario.creadoEn,
});

/**
 * Lógica de negocio de CU-01 (registro), CU-02 (autenticación) y CU-03 (recuperación de contraseña).
 */
export class AuthService {
  /**
   * @param {{
   *   usuarioRepository: import("../repositories/usuario.repository.interface.js").UsuarioRepositoryInterface,
   *   hashService: import("./hash.service.js").HashServiceInterface,
   *   jwtService: import("./jwt.service.js").JwtServiceInterface,
   *   mailService: import("./mail.service.js").MailServiceInterface,
   *   config: import("../config/config.js").config,
   * }} dependencias
   */
  constructor({ usuarioRepository, hashService, jwtService, mailService, config }) {
    this.usuarioRepository = usuarioRepository;
    this.hashService = hashService;
    this.jwtService = jwtService;
    this.mailService = mailService;
    this.config = config;
  }

  /**
   * CU-01. Crea la cuenta con la contraseña cifrada.
   * @param {{ nombre: string, email: string, password: string }} dto
   */
  async registrar({ nombre, email, password }) {
    const correo = normalizarEmail(email);
    const existente = await this.usuarioRepository.buscarPorEmail(correo);
    if (existente) {
      throw ApiError.conflict("El correo electrónico ya se encuentra registrado");
    }

    const passwordHash = await this.hashService.hash(password);
    const usuario = await this.usuarioRepository.crear({
      nombre: nombre.trim(),
      email: correo,
      passwordHash,
    });

    return aPerfilPublico(usuario);
  }

  /**
   * CU-02. Verifica credenciales y genera el token de sesión.
   * @param {{ email: string, password: string }} dto
   */
  async autenticar({ email, password }) {
    const usuario = await this.usuarioRepository.buscarPorEmail(normalizarEmail(email));
    // Mensaje genérico: no revela si el correo existe ni si la cuenta está activa.
    if (!usuario || !usuario.activo) throw credencialesInvalidas();

    const coincide = await this.hashService.compare(password, usuario.passwordHash);
    if (!coincide) throw credencialesInvalidas();

    const accessToken = await this.jwtService.firmarSesion({ userId: usuario.id, email: usuario.email });

    return {
      access_token: accessToken,
      token_type: "Bearer",
      expires_in: duracionASegundos(this.config.jwt.expiresIn),
      user: { id: usuario.id, nombre: usuario.nombre, email: usuario.email },
    };
  }

  /**
   * CU-03 (paso 1). Genera el token temporal, lo persiste y envía el correo.
   * Responde siempre de forma genérica para no revelar si el correo existe.
   * @param {{ email: string }} dto
   */
  async solicitarRecuperacion({ email }) {
    const correo = normalizarEmail(email);
    const usuario = await this.usuarioRepository.buscarPorEmail(correo);

    if (usuario && usuario.activo) {
      const { tokenTtlMinutes } = this.config.recovery;
      const token = await this.jwtService.firmarTokenRecuperacion(
        { userId: usuario.id },
        tokenTtlMinutes,
      );
      const expiraEn = new Date(Date.now() + tokenTtlMinutes * 60 * 1000);
      await this.usuarioRepository.guardarResetToken(usuario.id, { token, expiraEn });

      const enlace = `${this.config.server.clientUrl}/restablecer-contrasena?token=${encodeURIComponent(token)}`;
      try {
        await this.mailService.enviarRecuperacionContrasena({
          email: usuario.email,
          nombre: usuario.nombre,
          enlace,
        });
      } catch (error) {
        // El token no sirve sin correo: se invalida para no dejar credenciales vigentes.
        await this.usuarioRepository.limpiarResetToken(usuario.id);
        console.error("No fue posible enviar el correo de recuperación:", error.message);
      }
    }

    return { mensaje: MENSAJE_SOLICITUD_PROCESADA };
  }

  /**
   * CU-03. Comprueba la vigencia del enlace antes de mostrar el formulario de nueva contraseña.
   * @param {string} token
   */
  async validarTokenRecuperacion(token) {
    const usuario = await this.resolverUsuarioPorTokenRecuperacion(token);
    return { valido: true, email: usuario.email };
  }

  /**
   * CU-03 (paso 2). Actualiza la contraseña e invalida el token (de un solo uso).
   * @param {{ token: string, password: string }} dto
   */
  async restablecerContrasena({ token, password }) {
    const usuario = await this.resolverUsuarioPorTokenRecuperacion(token);
    const passwordHash = await this.hashService.hash(password);
    await this.usuarioRepository.actualizarPassword(usuario.id, passwordHash);
    await this.usuarioRepository.limpiarResetToken(usuario.id);
    return { mensaje: "Tu contraseña fue actualizada correctamente" };
  }

  /**
   * Valida firma, expiración y coincidencia con el token persistido.
   * @param {string} token
   * @returns {Promise<import("../repositories/usuario.repository.interface.js").Usuario>}
   */
  async resolverUsuarioPorTokenRecuperacion(token) {
    let payload;
    try {
      payload = this.jwtService.verificarTokenRecuperacion(token);
    } catch {
      throw tokenInvalido();
    }

    const usuario = await this.usuarioRepository.buscarPorId(payload.userId);
    const vigente =
      usuario &&
      usuario.activo &&
      usuario.resetToken === token &&
      usuario.resetTokenExpiresAt &&
      usuario.resetTokenExpiresAt.getTime() > Date.now();

    if (!vigente) throw tokenInvalido("El enlace de recuperación es inválido o ha caducado");
    return usuario;
  }
}
