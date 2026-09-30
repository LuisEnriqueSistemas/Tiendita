import { Router } from "express";
import { UsuarioController } from "../controllers/usuario.controller.js";
import { autenticar } from "../middlewares/auth.middleware.js";
import { validar } from "../middlewares/validate.middleware.js";
import { actualizarPerfilSchema } from "../schemas/usuario.schema.js";

/**
 * Rutas de gestión del perfil (CU-04). Todas requieren sesión activa.
 * @param {{
 *   usuarioService: import("../services/usuario.service.js").UsuarioService,
 *   jwtService: import("../services/jwt.service.js").JwtServiceInterface,
 * }} dependencias
 */
export const crearUsuarioRoutes = ({ usuarioService, jwtService }) => {
  const router = Router();
  const controller = new UsuarioController({ usuarioService });

  router.use(autenticar(jwtService));
  router.get("/mi-perfil", controller.obtenerPerfil);
  router.patch("/mi-perfil", validar(actualizarPerfilSchema), controller.actualizarPerfil);
  router.delete("/mi-perfil", controller.eliminarCuenta);

  return router;
};
