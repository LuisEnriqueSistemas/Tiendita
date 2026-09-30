import { Router } from "express";
import { z } from "zod";
import { CategoriaController } from "../controllers/categoria.controller.js";
import { autenticar } from "../middlewares/auth.middleware.js";
import { validar } from "../middlewares/validate.middleware.js";

const idParamSchema = z.object({
  id: z.coerce
    .number({ error: "El identificador de la categoría debe ser un número" })
    .int("El identificador de la categoría debe ser un entero")
    .positive("El identificador de la categoría debe ser mayor que cero"),
});

/**
 * Rutas de consulta del catálogo de categorías. Todas requieren sesión activa.
 * Las categorías son precargadas: no existen endpoints para crearlas ni modificarlas.
 * @param {{
 *   categoriaService: import("../services/categoria.service.js").CategoriaService,
 *   jwtService: import("../services/jwt.service.js").JwtServiceInterface,
 * }} dependencias
 */
export const crearCategoriaRoutes = ({ categoriaService, jwtService }) => {
  const router = Router();
  const controller = new CategoriaController({ categoriaService });

  router.use(autenticar(jwtService));
  router.get("/", controller.listar);
  router.get("/:id", validar(idParamSchema, "params"), controller.obtenerPorId);

  return router;
};
