import { unlink } from "node:fs/promises";
import path from "node:path";

/**
 * Contrato de almacenamiento de imágenes de productos (CU-05, fase 3).
 */
export class StorageServiceInterface {
  /**
   * Persiste el archivo subido y devuelve la ruta pública relativa.
   * @param {{ originalname: string, mimetype: string, size: number, [key: string]: unknown }} archivo
   * @returns {Promise<string>} Ruta pública, por ejemplo `9f2c....webp`.
   */
  // eslint-disable-next-line no-unused-vars
  async guardar(archivo) {
    throw new Error("No implementado");
  }

  /**
   * Elimina físicamente un archivo almacenado. Es idempotente: si ya no
   * existe, no falla, porque el producto pudo darse de baja antes.
   * @param {string} rutaPublica
   * @returns {Promise<void>}
   */
  // eslint-disable-next-line no-unused-vars
  async eliminar(rutaPublica) {
    throw new Error("No implementado");
  }
}

/**
 * Implementación sobre el sistema de archivos local (`servidor/uploads`).
 * No contiene lógica de negocio: solo mueve archivos.
 */
export class AlmacenamientoDiscoLocal extends StorageServiceInterface {
  /**
   * @param {{ dir: string, publicPath: string }} opciones
   */
  constructor({ dir, publicPath }) {
    super();
    this.rutaAbsoluta = path.resolve(dir);
    this.rutaPublica = publicPath;
  }

  async guardar(archivo) {
    return `${this.rutaPublica}/${archivo.filename}`;
  }

  async eliminar(rutaPublica) {
    if (!rutaPublica) return;
    // `resolve` + comparación con el prefijo evita salir del directorio de subidas.
    const ruta = path.resolve(this.rutaAbsoluta, path.basename(rutaPublica));
    if (!ruta.startsWith(this.rutaAbsoluta)) return;
    await unlink(ruta).catch(() => undefined);
  }
}
