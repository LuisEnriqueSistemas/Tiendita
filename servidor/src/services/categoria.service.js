import { CATEGORIAS_PRECARGADAS } from "../constants/categorias-precargadas.js";
import { ApiError } from "../utils/ApiError.util.js";

/**
 * Proyección pública de la categoría: oculta columnas internas
 * (`esFija`, `activo` y marcas de tiempo) que no aportan al cliente.
 * @param {import("../entities/Categoria.js").Categoria} categoria
 * @returns {{ id: number, nombre: string, descripcion: string|null }}
 */
const aRespuesta = (categoria) => ({
  id: categoria.id,
  nombre: categoria.nombre,
  descripcion: categoria.descripcion ?? null,
});

/**
 * Lógica de negocio del módulo de Categorías (CU-09 del módulo de Categorías).
 * Las categorías son datos precargados: solo se consultan y validan su existencia.
 */
export class CategoriaService {
  /**
   * @param {{ categoriaRepository: import("../repositories/categoria.repository.interface.js").CategoriaRepositoryInterface }} dependencias
   */
  constructor({ categoriaRepository }) {
    this.categoriaRepository = categoriaRepository;
  }

  /**
   * Lista todas las categorías activas.
   * @returns {Promise<{ id: number, nombre: string, descripcion: string|null }[]>}
   */
  async listar() {
    const categorias = await this.categoriaRepository.findAll();
    return categorias.map(aRespuesta);
  }

  /**
   * Devuelve la categoría activa solicitada.
   * @param {number} id
   * @returns {Promise<{ id: number, nombre: string, descripcion: string|null }>}
   * @throws {ApiError} 404 si la categoría no existe.
   */
  async obtenerPorId(id) {
    const categoria = await this.categoriaRepository.findById(id);
    if (!categoria) {
      throw ApiError.notFound(
        "La categoría no existe o está inactiva",
        "CATEGORIA_NO_ENCONTRADA",
      );
    }
    return aRespuesta(categoria);
  }

  /**
   * Verifica que la categoría exista y esté activa. Es la validación que el
   * módulo de Productos aplica antes de asociar una categoría a un producto.
   * @param {number} id
   * @returns {Promise<import("../entities/Categoria.js").Categoria>}
   * @throws {ApiError} 400 si la categoría no está disponible.
   */
  async exigirActiva(id) {
    const categoria = await this.categoriaRepository.findById(id);
    if (!categoria) throw ApiError.categoriaNoDisponible(id);
    return categoria;
  }

  /**
   * Precarga idempotente del catálogo fijo. Puede invocarse en cada arranque.
   * @param {{ nombre: string, descripcion?: string|null }[]} [categorias]
   * @returns {Promise<import("../entities/Categoria.js").Categoria[]>}
   */
  async precargar(categorias = CATEGORIAS_PRECARGADAS) {
    return this.categoriaRepository.precargar(categorias);
  }
}
