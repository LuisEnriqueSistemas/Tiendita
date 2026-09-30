import { CategoriaRepositoryInterface } from "../repositories/categoria.repository.interface.js";

/**
 * Implementación en memoria del contrato de categorías para pruebas.
 * Reproduce el filtro de activas y la precarga idempotente.
 */
export class CategoriaRepositoryFake extends CategoriaRepositoryInterface {
  /**
   * @param {object[]} [categorias] Categorías iniciales.
   */
  constructor(categorias = []) {
    super();
    this.categorias = new Map();
    this.ultimoSecuencia = 0;
    categorias.forEach((categoria) => this.#agregar({ esFija: true, activo: true, ...categoria }));
  }

  async findAll() {
    return [...this.categorias.values()]
      .filter((categoria) => categoria.activo)
      .sort((a, b) => a.id - b.id);
  }

  async findById(id) {
    const categoria = this.categorias.get(id);
    return categoria && categoria.activo ? categoria : null;
  }

  async precargar(categorias) {
    const nombresExistentes = new Set([...this.categorias.values()].map((c) => c.nombre));
    categorias
      .filter((categoria) => !nombresExistentes.has(categoria.nombre))
      .forEach((categoria) => this.#agregar({ esFija: true, activo: true, ...categoria }));
    return this.findAll();
  }

  #agregar(categoria) {
    this.ultimoSecuencia += 1;
    const nueva = {
      id: this.ultimoSecuencia,
      descripcion: null,
      creadoEn: new Date(),
      actualizadoEn: new Date(),
      ...categoria,
    };
    this.categorias.set(nueva.id, nueva);
    return nueva;
  }
}
