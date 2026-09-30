/**
 * Contrato de persistencia de usuarios.
 * La lógica de negocio depende únicamente de esta interfaz;
 * la implementación con TypeORM vive en `usuario.typeorm.repository.js`.
 *
 * @typedef {Object} Usuario
 * @property {number} id
 * @property {string} nombre
 * @property {string} email
 * @property {string} passwordHash
 * @property {string|null} resetToken
 * @property {Date|null} resetTokenExpiresAt
 * @property {boolean} activo
 * @property {Date|null} eliminadoEn
 * @property {Date} creadoEn
 * @property {Date} actualizadoEn
 */

export class UsuarioRepositoryInterface {
  /**
   * @param {string} email
   * @returns {Promise<Usuario|null>}
   */
  // eslint-disable-next-line no-unused-vars
  async buscarPorEmail(email) {
    throw new Error("No implementado");
  }

  /**
   * @param {number} id
   * @returns {Promise<Usuario|null>}
   */
  // eslint-disable-next-line no-unused-vars
  async buscarPorId(id) {
    throw new Error("No implementado");
  }

  /**
   * @param {{ nombre: string, email: string, passwordHash: string }} datos
   * @returns {Promise<Usuario>}
   */
  // eslint-disable-next-line no-unused-vars
  async crear(datos) {
    throw new Error("No implementado");
  }

  /**
   * @param {number} id
   * @param {{ nombre?: string, email?: string, passwordHash?: string }} cambios
   * @returns {Promise<Usuario|null>}
   */
  // eslint-disable-next-line no-unused-vars
  async actualizar(id, cambios) {
    throw new Error("No implementado");
  }

  /**
   * @param {number} id
   * @param {string} passwordHash
   * @returns {Promise<void>}
   */
  // eslint-disable-next-line no-unused-vars
  async actualizarPassword(id, passwordHash) {
    throw new Error("No implementado");
  }

  /**
   * @param {number} id
   * @param {{ token: string, expiraEn: Date }} datos
   * @returns {Promise<void>}
   */
  // eslint-disable-next-line no-unused-vars
  async guardarResetToken(id, datos) {
    throw new Error("No implementado");
  }

  /**
   * @param {number} id
   * @returns {Promise<void>}
   */
  // eslint-disable-next-line no-unused-vars
  async limpiarResetToken(id) {
    throw new Error("No implementado");
  }

  /**
   * Baja lógica: marca la cuenta como inactiva.
   * @param {number} id
   * @returns {Promise<Usuario|null>}
   */
  // eslint-disable-next-line no-unused-vars
  async eliminar(id) {
    throw new Error("No implementado");
  }
}
