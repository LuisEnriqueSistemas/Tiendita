import { ProductoRepositoryInterface } from "../repositories/producto.repository.interface.js";

const ORDENES = {
  recientes: (a, b) => new Date(b.creadoEn) - new Date(a.creadoEn),
  nombre_asc: (a, b) => a.nombre.localeCompare(b.nombre, "es"),
  nombre_desc: (a, b) => b.nombre.localeCompare(a.nombre, "es"),
  precio_venta_asc: (a, b) => Number(a.precioVenta) - Number(b.precioVenta),
  precio_venta_desc: (a, b) => Number(b.precioVenta) - Number(a.precioVenta),
};

/**
 * Implementación en memoria del contrato de productos para pruebas.
 * Aplica búsqueda insensible a mayúsculas, filtro por categoría, orden y paginación.
 */
export class ProductoRepositoryFake extends ProductoRepositoryInterface {
  /**
   * @param {object[]} [productos] Productos iniciales.
   * @param {import("../entities/Categoria.js").Categoria[]} [categorias] Categorías para asociar.
   */
  constructor(productos = [], categorias = []) {
    super();
    this.productos = new Map();
    this.categoriasPorId = new Map(categorias.map((categoria) => [categoria.id, categoria]));
    this.ultimoSecuencia = 0;
    productos.forEach((producto) => this.#guardar({ activo: true, imagen: null, descripcion: null, ...producto }));
  }

  async findAll({ nombre, categoriaId, pagina = 1, limite = 12, orden = "recientes" } = {}) {
    const coincidencias = [...this.productos.values()].filter((producto) => {
      if (!producto.activo) return false;
      if (categoriaId && producto.categoriaId !== categoriaId) return false;
      if (nombre && !producto.nombre.toLowerCase().includes(nombre.toLowerCase())) return false;
      return true;
    });

    const ordenados = coincidencias.sort(ORDENES[orden] ?? ORDENES.recientes);
    const inicio = (pagina - 1) * limite;

    return {
      productos: ordenados.slice(inicio, inicio + limite),
      total: ordenados.length,
    };
  }

  async findById(id) {
    const producto = this.productos.get(id);
    return producto && producto.activo ? producto : null;
  }

  async create(datos) {
    return this.#guardar({ activo: true, imagen: null, descripcion: null, ...datos });
  }

  async update(id, cambios) {
    const producto = this.productos.get(id);
    if (!producto) return null;
    const actualizado = { ...producto, ...cambios, actualizadoEn: new Date() };
    // Reproduce la relación `eager`: al cambiar de categoría se recarga la nueva.
    if (cambios.categoriaId !== undefined) {
      actualizado.categoria = this.categoriasPorId.get(actualizado.categoriaId) ?? null;
    }
    this.productos.set(id, actualizado);
    return actualizado;
  }

  async softDelete(id) {
    return this.update(id, { activo: false, eliminadoEn: new Date() });
  }

  async sumarPrecioVenta() {
    return [...this.productos.values()]
      .filter((producto) => producto.activo)
      .reduce((total, producto) => total + Number(producto.precioVenta), 0);
  }

  #guardar(producto) {
    this.ultimoSecuencia += 1;
    const nuevo = {
      id: this.ultimoSecuencia,
      creadoEn: new Date(),
      actualizadoEn: new Date(),
      ...producto,
      categoria: producto.categoria ?? this.categoriasPorId.get(producto.categoriaId) ?? null,
    };
    this.productos.set(nuevo.id, nuevo);
    return nuevo;
  }
}
