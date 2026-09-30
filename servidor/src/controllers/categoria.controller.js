/**
 * Controlador de solo lectura del catálogo de categorías.
 */
export class CategoriaController {
  /**
   * @param {{ categoriaService: import("../services/categoria.service.js").CategoriaService }} dependencias
   */
  constructor({ categoriaService }) {
    this.categoriaService = categoriaService;
  }

  /** GET /api/categorias */
  listar = async (req, res) => {
    const categorias = await this.categoriaService.listar();
    return res.status(200).json({ categorias });
  };

  /** GET /api/categorias/:id */
  obtenerPorId = async (req, res) => {
    const categoria = await this.categoriaService.obtenerPorId(Number(req.params.id));
    return res.status(200).json(categoria);
  };
}
