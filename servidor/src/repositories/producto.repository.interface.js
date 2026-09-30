/**
 * Contrato de persistencia de productos.
 * La lógica de negocio depende únicamente de esta interfaz;
 * la implementación con TypeORM vive en `producto.typeorm.repository.js`.
 *
 * @typedef {Object} Producto
 * @property {number} id
 * @property {string} nombre
 * @property {string|null} imagen
 * @property {string|null} descripcion
 * @property {string|number} precioProveedor
 * @property {string|number} precioVenta
 * @property {number} categoriaId
 * @property {import("../entities/Categoria.js").Categoria} categoria
 * @property {boolean} activo
 * @property {Date|null} eliminadoEn
 * @property {Date} creadoEn
 * @property {Date} actualizadoEn
 *
 * @typedef {Object} FiltrosProductos
 * @property {string} [nombre] Búsqueda parcial por nombre (sin distinguir mayúsculas).
 * @property {number} [categoriaId] Categoría exacta.
 * @property {number} [pagina] Página 1-indexada.
 * @property {number} [limite] Registros por página.
 * @property {import("../constants/orden-productos.js").OrdenProducto} [orden]
 */

export class ProductoRepositoryInterface {
  /**
   * @param {FiltrosProductos} filtros
   * @returns {Promise<{ productos: Producto[], total: number }>}
   */
  // eslint-disable-next-line no-unused-vars
  async findAll(filtros) {
    throw new Error("No implementado");
  }

  /**
   * @param {number} id
   * @returns {Promise<Producto|null>}
   */
  // eslint-disable-next-line no-unused-vars
  async findById(id) {
    throw new Error("No implementado");
  }

  /**
   * @param {{ nombre: string, descripcion?: string|null, precioProveedor: number, precioVenta: number, categoriaId: number, imagen?: string|null }} datos
   * @returns {Promise<Producto>}
   */
  // eslint-disable-next-line no-unused-vars
  async create(datos) {
    throw new Error("No implementado");
  }

  /**
   * @param {number} id
   * @param {Partial<{ nombre: string, descripcion: string|null, precioProveedor: number, precioVenta: number, categoriaId: number, imagen: string|null }>} cambios
   * @returns {Promise<Producto|null>}
   */
  // eslint-disable-next-line no-unused-vars
  async update(id, cambios) {
    throw new Error("No implementado");
  }

  /**
   * Baja lógica: marca el producto como inactivo y conserva el historial.
   * @param {number} id
   * @returns {Promise<Producto|null>}
   */
  // eslint-disable-next-line no-unused-vars
  async softDelete(id) {
    throw new Error("No implementado");
  }

  /**
   * Suma de `precioVenta` de los productos activos.
   * @returns {Promise<string|number>}
   */
  // eslint-disable-next-line no-unused-vars
  async sumarPrecioVenta() {
    throw new Error("No implementado");
  }
}
