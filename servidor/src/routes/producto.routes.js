import { Router } from "express";
import { ProductoController } from "../controllers/producto.controller.js";
import { autenticar } from "../middlewares/auth.middleware.js";
import { crearMiddlewareImagen } from "../middlewares/upload.middleware.js";
import { validar } from "../middlewares/validate.middleware.js";
import {
  actualizarProductoSchema,
  crearProductoSchema,
  filtrosProductosSchema,
  idProductoParamSchema,
} from "../schemas/producto.schema.js";

/**
 * Rutas de gestión de productos (CU-05 a CU-09). Todas requieren sesión activa.
 * La escritura usa `multipart/form-data` para adjuntar la imagen del producto.
 * @param {{
 *   productoService: import("../services/producto.service.js").ProductoService,
 *   categoriaService: import("../services/categoria.service.js").CategoriaService,
 *   jwtService: import("../services/jwt.service.js").JwtServiceInterface,
 *   config: import("../config/config.js").config,
 * }} dependencias
 */
export const crearProductoRoutes = ({ productoService, categoriaService, jwtService, config }) => {
  const router = Router();
  const controller = new ProductoController({ productoService, categoriaService });
  const imagen = crearMiddlewareImagen(config.uploads);

  router.use(autenticar(jwtService));

  router.get("/resumen", controller.resumen);
  router.get("/", validar(filtrosProductosSchema, "query"), controller.listar);
  router.get("/:id", validar(idProductoParamSchema, "params"), controller.obtenerPorId);

  router.post("/", imagen, validar(crearProductoSchema), controller.crear);
  router.patch(
    "/:id",
    validar(idProductoParamSchema, "params"),
    imagen,
    validar(actualizarProductoSchema),
    controller.actualizar,
  );

  router.delete("/:id", validar(idProductoParamSchema, "params"), controller.eliminar);

  return router;
};
