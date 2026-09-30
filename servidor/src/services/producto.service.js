import { ORDEN_POR_DEFECTO } from "../schemas/producto.schema.js";
import { ApiError } from "../utils/ApiError.util.js";

/** Registros devueltos por el listado cuando el cliente no pide paginación. */
const LIMITE_POR_DEFECTO = 12;

/**
 * Convierte los `decimal` de PostgreSQL (que llegan como texto) a número.
 * @param {string|number|null} valor
 * @returns {number}
 */
const aNumero = (valor) => (valor === null || valor === undefined ? 0 : Number(valor));

/**
 * Lógica de negocio del módulo de Productos (CU-05 a CU-09).
 * Valida la categoría a través del módulo de Categorías y administra las imágenes.
 */
export class ProductoService {
  /**
   * @param {{
   *   productoRepository: import("../repositories/producto.repository.interface.js").ProductoRepositoryInterface,
   *   categoriaService: import("../services/categoria.service.js").CategoriaService,
   *   storageService: import("../services/storage.service.js").StorageServiceInterface,
   *   config: import("../config/config.js").config,
   * }} dependencias
   */
  constructor({ productoRepository, categoriaService, storageService, config }) {
    this.productoRepository = productoRepository;
    this.categoriaService = categoriaService;
    this.storageService = storageService;
    this.basePublica = config.server.publicBaseUrl.replace(/\/+$/, "");
  }

  /**
   * CU-05: registra un producto y guarda su imagen.
   * @param {{
   *   nombre: string, descripcion?: string|null, precioProveedor: number, precioVenta: number,
   *   categoriaId: number, imagen?: import("express").Multer.File|null,
   * }} datos
   * @returns {Promise<object>} Producto listo para responder.
   */
  async crear(datos) {
    await this.categoriaService.exigirActiva(datos.categoriaId);

    const imagen = datos.imagen
      ? await this.storageService.guardar(datos.imagen)
      : null;

    const producto = await this.productoRepository.create({
      nombre: datos.nombre,
      descripcion: datos.descripcion ?? null,
      precioProveedor: datos.precioProveedor,
      precioVenta: datos.precioVenta,
      categoriaId: datos.categoriaId,
      imagen,
    });

    return this.aRespuesta(producto);
  }

  /**
   * CU-06: lista productos con búsqueda por nombre y filtro por categoría.
   * @param {{
   *   nombre?: string, categoriaId?: number, pagina?: number, limite?: number, orden?: string,
   * }} [filtros]
   */
  async listar(filtros = {}) {
    const pagina = filtros.pagina ?? 1;
    const limite = filtros.limite ?? LIMITE_POR_DEFECTO;
    const orden = filtros.orden ?? ORDEN_POR_DEFECTO;

    const { productos, total } = await this.productoRepository.findAll({
      nombre: filtros.nombre,
      categoriaId: filtros.categoriaId,
      pagina,
      limite,
      orden,
    });

    return {
      productos: productos.map((producto) => this.aRespuesta(producto)),
      paginacion: {
        total,
        pagina,
        limite,
        totalPaginas: Math.max(1, Math.ceil(total / limite)),
      },
    };
  }

  /**
   * CU-06 / CU-07: obtiene un producto activo.
   * @param {number} id
   * @returns {Promise<object>}
   * @throws {ApiError} 404 si el producto no existe o fue dado de baja.
   */
  async obtenerPorId(id) {
    const producto = await this.exigirProducto(id);
    return this.aRespuesta(producto);
  }

  /**
   * CU-07: actualiza los campos enviados y reemplaza la imagen si llega una nueva.
   * @param {number} id
   * @param {{
   *   nombre?: string, descripcion?: string|null, precioProveedor?: number, precioVenta?: number,
   *   categoriaId?: number, imagen?: import("express").Multer.File|null,
   * }} datos
   * @returns {Promise<object>}
   */
  async actualizar(id, datos) {
    const producto = await this.exigirProducto(id);

    if (datos.categoriaId !== undefined) {
      await this.categoriaService.exigirActiva(datos.categoriaId);
    }

    const cambios = {};
    for (const campo of ["nombre", "descripcion", "precioProveedor", "precioVenta", "categoriaId"]) {
      if (datos[campo] !== undefined) cambios[campo] = datos[campo] ?? null;
    }

    if (Object.keys(cambios).length === 0 && !datos.imagen) {
      throw ApiError.badRequest("Debes enviar al menos un campo para actualizar", [
        { campo: "producto", mensaje: "Modifica el nombre, los precios, la categoría o la imagen" },
      ]);
    }

    let imagenAnterior = null;
    if (datos.imagen) {
      cambios.imagen = await this.storageService.guardar(datos.imagen);
      imagenAnterior = producto.imagen;
    }

    const actualizado = await this.productoRepository.update(id, cambios);

    // La imagen previa solo se borra cuando la escritura tuvo éxito.
    if (imagenAnterior && imagenAnterior !== cambios.imagen) {
      await this.storageService.eliminar(imagenAnterior);
    }

    return this.aRespuesta(actualizado ?? producto);
  }

  /**
   * CU-08: baja lógica. El producto deja de aparecer en el listado y se conserva el historial.
   * @param {number} id
   * @returns {Promise<{ mensaje: string }>}
   */
  async eliminar(id) {
    const producto = await this.exigirProducto(id);
    await this.productoRepository.softDelete(producto.id);
    return { mensaje: "El producto fue eliminado correctamente" };
  }

  /**
   * Suma de precios de venta del inventario activo. Alimenta el KPI del dashboard.
   * @returns {Promise<number>}
   */
  async valorInventario() {
    return aNumero(await this.productoRepository.sumarPrecioVenta());
  }

  /**
   * @param {number} id
   * @returns {Promise<import("../entities/Producto.js").Producto>}
   */
  async exigirProducto(id) {
    const producto = await this.productoRepository.findById(id);
    if (!producto) throw ApiError.productoNoEncontrado(id);
    return producto;
  }

  /**
   * Proyecta la entidad a la respuesta pública: agrega la URL absoluta de la
   * imagen y convierte los `decimal` de PostgreSQL a número.
   * @param {import("../entities/Producto.js").Producto} producto
   * @returns {object}
   */
  aRespuesta(producto) {
    return {
      id: producto.id,
      nombre: producto.nombre,
      descripcion: producto.descripcion ?? null,
      imagenUrl: producto.imagen ? `${this.basePublica}${producto.imagen}` : null,
      precioProveedor: aNumero(producto.precioProveedor),
      precioVenta: aNumero(producto.precioVenta),
      margen: aNumero(
        (aNumero(producto.precioVenta) - aNumero(producto.precioProveedor)).toFixed(2),
      ),
      categoriaId: producto.categoriaId,
      categoria: producto.categoria
        ? { id: producto.categoria.id, nombre: producto.categoria.nombre }
        : null,
      activo: producto.activo,
      creadoEn: producto.creadoEn,
      actualizadoEn: producto.actualizadoEn,
    };
  }
}
