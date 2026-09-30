import { ApiError } from "../utils/ApiError.util.js";
import { normalizarEmail } from "./auth.service.js";

/**
 * Lógica de negocio de CU-04: consultar, actualizar y eliminar la cuenta.
 */
export class UsuarioService {
  /**
   * @param {{
   *   usuarioRepository: import("../repositories/usuario.repository.interface.js").UsuarioRepositoryInterface,
   *   hashService: import("./hash.service.js").HashServiceInterface,
   * }} dependencias
   */
  constructor({ usuarioRepository, hashService }) {
    this.usuarioRepository = usuarioRepository;
    this.hashService = hashService;
  }

  /**
   * @param {number} userId Identificador tomado del token de sesión.
   */
  async obtenerPerfil(userId) {
    const usuario = await this.usuarioRepository.buscarPorId(userId);
    if (!usuario || !usuario.activo) {
      throw ApiError.notFound("El usuario no existe o su cuenta fue eliminada");
    }
    return {
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      creadoEn: usuario.creadoEn,
    };
  }

  /**
   * @param {number} userId
   * @param {{ nombre?: string, email?: string, password?: string }} dto
   */
  async actualizarPerfil(userId, dto) {
    await this.obtenerPerfil(userId);

    const cambios = {};
    if (dto.nombre !== undefined) cambios.nombre = dto.nombre.trim();

    if (dto.email !== undefined) {
      const correo = normalizarEmail(dto.email);
      const existente = await this.usuarioRepository.buscarPorEmail(correo);
      if (existente && existente.id !== userId) {
        throw ApiError.conflict("El correo electrónico ya se encuentra registrado");
      }
      cambios.email = correo;
    }

    if (dto.password !== undefined) {
      cambios.passwordHash = await this.hashService.hash(dto.password);
    }

    const usuario = await this.usuarioRepository.actualizar(userId, cambios);
    if (!usuario) throw ApiError.notFound("El usuario no existe o su cuenta fue eliminada");

    return { id: usuario.id, nombre: usuario.nombre, email: usuario.email };
  }

  /**
   * Baja lógica de la cuenta e invalidación de tokens de recuperación.
   * @param {number} userId
   */
  async eliminarCuenta(userId) {
    await this.obtenerPerfil(userId);
    await this.usuarioRepository.eliminar(userId);
    return { mensaje: "Tu cuenta fue eliminada correctamente" };
  }
}
