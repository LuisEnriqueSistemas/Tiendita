import multer from "multer";
import { CODIGO_ERROR } from "../constants/codigos-error.js";
import { ApiError } from "../utils/ApiError.util.js";
import { config } from "../config/config.js";

/** Error para rutas no registradas. */
export const rutaNoEncontrada = (req, res, next) => {
  next(
    new ApiError(
      404,
      CODIGO_ERROR.RUTA_NO_ENCONTRADA,
      `La ruta ${req.method} ${req.originalUrl} no existe`,
    ),
  );
};

/** Traduce el error de unicidad de PostgreSQL a un conflicto de negocio. */
const esViolacionDeUnicidad = (error) => error?.code === "23505";

/** Traduce los errores de `multer` a un 400 con el contrato de error del proyecto. */
const aErrorDeImagen = (error) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      const limiteMb = config.uploads.maxSizeBytes / (1024 * 1024);
      return ApiError.badRequest(
        "La imagen supera el tamaño máximo permitido",
        [{ campo: "imagen", mensaje: `El tamaño máximo permitido es ${limiteMb} MB` }],
        CODIGO_ERROR.IMAGEN_INVALIDA,
      );
    }
    if (error.code === "LIMIT_UNEXPECTED_FILE") {
      return ApiError.badRequest(
        "Solo se admite un archivo de imagen",
        [{ campo: "imagen", mensaje: "Envía la imagen en el campo 'imagen'" }],
        CODIGO_ERROR.IMAGEN_INVALIDA,
      );
    }
  }
  return null;
};

/**
 * Manejador centralizado de errores.
 * Responde siempre con la forma { error: { codigo, mensaje, detalles } }.
 */
// eslint-disable-next-line no-unused-vars
export const manejarErrores = (error, req, res, next) => {
  if (error instanceof ApiError) {
    return res.status(error.status).json(error.toJSON());
  }

  const errorDeImagen = aErrorDeImagen(error);
  if (errorDeImagen) {
    return res.status(errorDeImagen.status).json(errorDeImagen.toJSON());
  }

  // Restricción de clave foránea: la categoría referenciada no existe.
  if (error?.code === "23503") {
    return res.status(400).json(
      new ApiError(
        400,
        CODIGO_ERROR.CATEGORIA_NO_DISPONIBLE,
        "La categoría seleccionada no está disponible",
        [{ campo: "categoriaId", mensaje: "Elige una categoría existente" }],
      ).toJSON(),
    );
  }

  if (esViolacionDeUnicidad(error)) {
    return res
      .status(409)
      .json(new ApiError(409, CODIGO_ERROR.EMAIL_YA_REGISTRADO, "El correo electrónico ya se encuentra registrado").toJSON());
  }

  if (error instanceof SyntaxError && "body" in error) {
    return res
      .status(400)
      .json(new ApiError(400, CODIGO_ERROR.VALIDACION_FALLIDA, "El cuerpo de la petición no es JSON válido").toJSON());
  }

  console.error(`[${config.server.nodeEnv}] Error no controlado:`, error);
  return res.status(500).json(ApiError.internal().toJSON());
};
