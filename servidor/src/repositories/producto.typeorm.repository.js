import { ILike } from "typeorm";
import { columnaDeOrden } from "../constants/orden-productos.js";
import { Producto } from "../entities/Producto.js";
import { ProductoRepositoryInterface } from "./producto.repository.interface.js";

/**
 * Implementación del contrato de productos sobre TypeORM.
 * No contiene lógica de negocio: solo acceso a datos.
 */
export class ProductoTypeOrmRepository extends ProductoRepositoryInterface {
  /**
   * @param {import("typeorm").DataSource} dataSource
   */
  constructor(dataSource) {
    super();
    this.repository = dataSource.getRepository(Producto);
  }

  async findAll({ nombre, categoriaId, pagina = 1, limite = 12, orden } = {}) {
    const where = { activo: true };
    // `ILike` hace la búsqueda insensible a mayúsculas: "gaseosa" encuentra "Gaseosa".
    if (nombre) where.nombre = ILike(`%${escaparComodines(nombre)}%`);
    if (categoriaId) where.categoriaId = categoriaId;

    const [productos, total] = await this.repository.findAndCount({
      where,
      order: columnaDeOrden(orden),
      skip: (pagina - 1) * limite,
      take: limite,
    });

    return { productos, total };
  }

  async findById(id) {
    return this.repository.findOne({ where: { id, activo: true } });
  }

  async create(datos) {
    const creado = await this.repository.save(this.repository.create(datos));
    // Se relee para traer la categoría (relación eager) que `save` no devuelve.
    return this.findById(creado.id);
  }

  async update(id, cambios) {
    const producto = await this.repository.findOne({ where: { id } });
    if (!producto) return null;
    // `update` con columnas simples evita que la relación `categoria` ya cargada
    // (eager) vuelva a escribir la categoría anterior: aquí manda `categoriaId`.
    await this.repository.update({ id }, cambios);
    // Se relee para devolver la categoría actualizada (relación eager).
    return this.findById(id);
  }

  async softDelete(id) {
    const producto = await this.repository.findOne({ where: { id, activo: true } });
    if (!producto) return null;
    producto.activo = false;
    producto.eliminadoEn = new Date();
    return this.repository.save(producto);
  }

  async sumarPrecioVenta() {
    const resultado = await this.repository
      .createQueryBuilder("producto")
      .select("COALESCE(SUM(producto.precioVenta), 0)", "total")
      .where("producto.activo = true")
      .getRawOne();
    return resultado?.total ?? 0;
  }
}

/**
 * Escapa `%`, `_` y `\` para que el usuario pueda buscar literalmente esos
 * caracteres sin que PostgreSQL los interprete como comodines.
 * @param {string} texto
 * @returns {string}
 */
const escaparComodines = (texto) => texto.replace(/[\\%_]/g, (caracter) => `\\${caracter}`);
