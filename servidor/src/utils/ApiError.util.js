import { CODIGO_ERROR } from "../constants/codigos-error.js";

/**
 * Error de dominio controlado.
 * Contiene el status HTTP, un código estable para el cliente y detalles de validación.
 */
export class ApiError extends Error {
  /**
   * @param {number} status Código de estado HTTP.
   * @param {string} codigo Código estable de error.
   * @param {string} mensaje Mensaje en español para el usuario.
   * @param {Array<{ campo: string, mensaje: string }>} detalles Detalles de validación.
   */
  constructor(status, codigo, mensaje, detalles = []) {
    super(mensaje);
    this.name = "ApiError";
    this.status = status;
    this.codigo = codigo;
    this.detalles = detalles;
  }

  static badRequest(mensaje, detalles = [], codigo = CODIGO_ERROR.VALIDACION_FALLIDA) {
    return new ApiError(400, codigo, mensaje, detalles);
  }

  static unauthorized(mensaje = "No autenticado", codigo = CODIGO_ERROR.NO_AUTENTICADO) {
    return new ApiError(401, codigo, mensaje);
  }

  static notFound(mensaje, codigo = CODIGO_ERROR.USUARIO_NO_ENCONTRADO) {
    return new ApiError(404, codigo, mensaje);
  }

  static categoriaNoDisponible(categoriaId) {
    return new ApiError(
      400,
      CODIGO_ERROR.CATEGORIA_NO_DISPONIBLE,
      "La categoría seleccionada no está disponible",
      [{ campo: "categoriaId", mensaje: `La categoría ${categoriaId} no existe o está inactiva` }],
    );
  }

  static productoNoEncontrado(id) {
    return new ApiError(
      404,
      CODIGO_ERROR.PRODUCTO_NO_ENCONTRADO,
      "El producto no existe o fue eliminado",
      [{ campo: "id", mensaje: `No existe un producto con el identificador ${id}` }],
    );
  }

  static conflict(mensaje, codigo = CODIGO_ERROR.EMAIL_YA_REGISTRADO) {
    return new ApiError(409, codigo, mensaje);
  }

  static internal(mensaje = "Error interno del servidor") {
    return new ApiError(500, CODIGO_ERROR.ERROR_INTERNO, mensaje);
  }

  toJSON() {
    return {
      error: {
        codigo: this.codigo,
        mensaje: this.message,
        detalles: this.detalles,
      },
    };
  }
}
