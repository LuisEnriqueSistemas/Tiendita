import { CODIGO_ERROR } from "../constants/codigos-error.js";
import { ApiError } from "../utils/ApiError.util.js";

/**
 * Extrae el token del encabezado Authorization.
 * @param {import("express").Request} req
 * @returns {string|null}
 */
const extraerToken = (req) => {
  const encabezado = req.headers.authorization;
  if (!encabezado) return null;
  const [esquema, token] = encabezado.split(" ");
  if (!token || esquema.toLowerCase() !== "bearer") return null;
  return token.trim();
};

/**
 * Middleware de autenticación: valida el JWT de sesión
 * y deja la identidad del usuario en `req.usuario`.
 */
export const autenticar = (jwtService) => (req, res, next) => {
  const token = extraerToken(req);
  if (!token) {
    return next(
      new ApiError(401, CODIGO_ERROR.NO_AUTENTICADO, "Debes iniciar sesión para continuar"),
    );
  }

  try {
    const { userId, email } = jwtService.verificarSesion(token);
    req.usuario = { id: userId, email };
    return next();
  } catch {
    return next(
      new ApiError(
        401,
        CODIGO_ERROR.TOKEN_AUTENTICACION_INVALIDO,
        "La sesión no es válida o ha expirado",
      ),
    );
  }
};
