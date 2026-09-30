import { randomUUID } from "node:crypto";
import { mkdirSync } from "node:fs";
import path from "node:path";
import multer from "multer";
import { CODIGO_ERROR } from "../constants/codigos-error.js";
import { ApiError } from "../utils/ApiError.util.js";

/** Extensiones permitidas, derivadas de los MIME configurados. */
const EXTENSION_POR_MIME = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

/** Nombre de archivo legible, sin acentos ni caracteres problemáticos. */
const normalizarNombre = (nombre) =>
  path
    .basename(nombre, path.extname(nombre))
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase()
    .slice(0, 60);

/**
 * Construye el middleware de `multer` para el campo `imagen`.
 * Valida tamaño y tipo antes de escribir en disco.
 *
 * @param {{ dir: string, maxSizeBytes: number, mimeTypes: string[] }} opciones
 * @returns {import("express").RequestHandler}
 */
export const crearMiddlewareImagen = ({ dir, maxSizeBytes, mimeTypes }) => {
  const rutaAbsoluta = path.resolve(dir);
  mkdirSync(rutaAbsoluta, { recursive: true });

  const almacenamiento = multer.diskStorage({
    destination: (_req, _archivo, cb) => cb(null, rutaAbsoluta),
    filename: (_req, archivo, cb) => {
      const extension = EXTENSION_POR_MIME[archivo.mimetype] ?? ".bin";
      const base = normalizarNombre(archivo.originalname) || "producto";
      cb(null, `${Date.now()}-${randomUUID().slice(0, 8)}-${base}${extension}`);
    },
  });

  const archivoFilter = (_req, archivo, cb) => {
    if (!mimeTypes.includes(archivo.mimetype)) {
      return cb(
        ApiError.badRequest(
          "El archivo de imagen no tiene un formato permitido",
          [{ campo: "imagen", mensaje: `Formatos admitidos: ${mimeTypes.join(", ")}` }],
          CODIGO_ERROR.IMAGEN_INVALIDA,
        ),
      );
    }
    return cb(null, true);
  };

  return multer({
    storage: almacenamiento,
    limits: { fileSize: maxSizeBytes, files: 1 },
    fileFilter: archivoFilter,
  }).single("imagen");
};
