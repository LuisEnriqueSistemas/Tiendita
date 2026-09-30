import { Router } from "express";
import { crearAuthRoutes } from "./auth.routes.js";
import { crearCategoriaRoutes } from "./categoria.routes.js";
import { crearProductoRoutes } from "./producto.routes.js";
import { crearUsuarioRoutes } from "./usuario.routes.js";

/**
 * Composition root de rutas de la API.
 * @param {ReturnType<import("../utils/container.util.js").crearContenedor>} contenedor
 */
export const crearRoutes = (contenedor) => {
  const router = Router();

  router.get("/salud", (req, res) => {
    res.status(200).json({ estado: "ok", servicio: "tienda" });
  });

  router.use("/auth", crearAuthRoutes(contenedor));
  router.use("/usuarios", crearUsuarioRoutes(contenedor));
  router.use("/categorias", crearCategoriaRoutes(contenedor));
  router.use("/productos", crearProductoRoutes(contenedor));

  return router;
};
