import { Router } from "express";
import { AuthController } from "../controllers/auth.controller.js";
import { validar } from "../middlewares/validate.middleware.js";
import {
  loginSchema,
  recuperarContrasenaSchema,
  registroSchema,
  restablecerContrasenaSchema,
  validarTokenRecuperacionSchema,
} from "../schemas/auth.schema.js";

/**
 * Rutas de autenticación (CU-01, CU-02, CU-03).
 * @param {{ authService: import("../services/auth.service.js").AuthService }} dependencias
 */
export const crearAuthRoutes = ({ authService }) => {
  const router = Router();
  const controller = new AuthController({ authService });

  router.post("/registro", validar(registroSchema), controller.registrar);
  router.post("/login", validar(loginSchema), controller.login);
  router.post(
    "/recuperar-contrasena",
    validar(recuperarContrasenaSchema),
    controller.recuperarContrasena,
  );
  router.get(
    "/validar-token-recuperacion",
    validar(validarTokenRecuperacionSchema, "query"),
    controller.validarTokenRecuperacion,
  );
  router.post(
    "/restablecer-contrasena",
    validar(restablecerContrasenaSchema),
    controller.restablecerContrasena,
  );

  return router;
};
