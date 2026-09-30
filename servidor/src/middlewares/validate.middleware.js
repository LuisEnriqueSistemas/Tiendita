import { ApiError } from "../utils/ApiError.util.js";

/**
 * Traduce los errores de Zod al contrato de error del proyecto.
 * @param {import("zod").ZodError} error
 * @returns {ApiError}
 */
const aApiError = (error) =>
  ApiError.badRequest(
    "Los datos enviados no son válidos",
    error.issues.map((issue) => ({
      campo: issue.path.join("."),
      mensaje: issue.message,
    })),
  );

/**
 * Valida body, query o params contra un esquema de Zod antes del caso de uso.
 * @param {import("zod").ZodType} esquema
 * @param {"body"|"query"|"params"} [fuente]
 */
export const validar = (esquema, fuente = "body") => (req, res, next) => {
  // En Express 5 `req.body` queda `undefined` si la petición no trae cuerpo.
  const resultado = esquema.safeParse(req[fuente] ?? {});

  if (!resultado.success) {
    return next(aApiError(resultado.error));
  }

  // `req.query` es un getter de solo lectura en Express 5: se reemplaza la propiedad.
  if (fuente === "query") {
    Object.defineProperty(req, "query", { value: resultado.data, writable: true });
  } else {
    req[fuente] = resultado.data;
  }

  return next();
};
