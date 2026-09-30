/**
 * Contrato de persistencia de categorías.
 * La lógica de negocio depende únicamente de esta interfaz;
 * la implementación con TypeORM vive en `categoria.typeorm.repository.js`.
 *
 * @typedef {Object} Categoria
 * @property {number} id
 * @property {string} nombre
 * @property {string|null} descripcion
 * @property {boolean} esFija
 * @property {boolean} activo
 * @property {Date} creadoEn
 * @property {Date} actualizadoEn
 */

export class CategoriaRepositoryInterface {
  /**
   * @returns {Promise<Categoria[]>}
   */
  // eslint-disable-next-line no-unused-vars
  async findAll() {
    throw new Error("No implementado");
  }

  /**
   * @param {number} id
   * @returns {Promise<Categoria|null>}
   */
  // eslint-disable-next-line no-unused-vars
  async findById(id) {
    throw new Error("No implementado");
  }

  /**
   * Precarga idempotente: inserta las categorías cuyo nombre no existe.
   * @param {{ nombre: string, descripcion?: string|null }[]} categorias
   * @returns {Promise<Categoria[]>} Categorías presentes tras la precarga.
   */
  // eslint-disable-next-line no-unused-vars
  async precargar(categorias) {
    throw new Error("No implementado");
  }
}
