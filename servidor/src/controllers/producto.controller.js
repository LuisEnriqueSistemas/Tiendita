/**
 * Controlador de productos (CU-05 a CU-09).
 * Solo traduce entre HTTP y el caso de uso: no contiene lógica de negocio.
 */
export class ProductoController {
  /**
   * @param {{
   *   productoService: import("../services/producto.service.js").ProductoService,
   *   categoriaService: import("../services/categoria.service.js").CategoriaService,
   * }} dependencias
   */
  constructor({ productoService, categoriaService }) {
    this.productoService = productoService;
    this.categoriaService = categoriaService;
  }

  /** GET /api/productos */
  listar = async (req, res) => {
    const resultado = await this.productoService.listar(req.query);
    return res.status(200).json(resultado);
  };

  /** GET /api/productos/:id */
  obtenerPorId = async (req, res) => {
    const producto = await this.productoService.obtenerPorId(Number(req.params.id));
    return res.status(200).json(producto);
  };

  /** POST /api/productos (multipart/form-data) */
  crear = async (req, res) => {
    const producto = await this.productoService.crear({ ...req.body, imagen: req.file ?? null });
    return res.status(201).json(producto);
  };

  /** PATCH /api/productos/:id (multipart/form-data) */
  actualizar = async (req, res) => {
    const producto = await this.productoService.actualizar(Number(req.params.id), {
      ...req.body,
      imagen: req.file ?? null,
    });
    return res.status(200).json(producto);
  };

  /** DELETE /api/productos/:id */
  eliminar = async (req, res) => {
    const { mensaje } = await this.productoService.eliminar(Number(req.params.id));
    return res.status(200).json({ mensaje });
  };

  /**
   * GET /api/productos/resumen
   * Indicadores del dashboard. Se declara antes que `/:id` para que
   * Express no interprete "resumen" como un identificador.
   */
  resumen = async (req, res) => {
    const [listado, valorInventario, categorias] = await Promise.all([
      this.productoService.listar({ limite: 1 }),
      this.productoService.valorInventario(),
      this.categoriaService.listar(),
    ]);

    return res.status(200).json({
      totalProductos: listado.paginacion.total,
      totalCategorias: categorias.length,
      valorInventario,
    });
  };
}
