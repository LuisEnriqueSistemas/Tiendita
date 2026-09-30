import { Categoria } from "../entities/Categoria.js";
import { CategoriaRepositoryInterface } from "./categoria.repository.interface.js";

/**
 * Implementación del contrato de categorías sobre TypeORM.
 * No contiene lógica de negocio: solo acceso a datos.
 */
export class CategoriaTypeOrmRepository extends CategoriaRepositoryInterface {
  /**
   * @param {import("typeorm").DataSource} dataSource
   */
  constructor(dataSource) {
    super();
    this.repository = dataSource.getRepository(Categoria);
  }

  async findAll() {
    return this.repository.find({ where: { activo: true }, order: { id: "ASC" } });
  }

  async findById(id) {
    return this.repository.findOne({ where: { id, activo: true } });
  }

  async precargar(categorias) {
    const existentes = await this.repository.find();
    const nombresExistentes = new Set(existentes.map((categoria) => categoria.nombre));

    const nuevas = categorias.filter((categoria) => !nombresExistentes.has(categoria.nombre));

    if (nuevas.length > 0) {
      await this.repository.save(
        nuevas.map((categoria) => this.repository.create({ ...categoria, esFija: true, activo: true })),
      );
    }

    return this.findAll();
  }
}
