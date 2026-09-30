import { StorageServiceInterface } from "../services/storage.service.js";

/**
 * Implementación en memoria del contrato de almacenamiento para pruebas.
 * No toca el sistema de archivos: registra las operaciones realizadas.
 */
export class StorageServiceFake extends StorageServiceInterface {
  constructor() {
    super();
    this.archivados = [];
    this.eliminados = [];
    this.contador = 0;
  }

  async guardar(archivo) {
    this.contador += 1;
    const ruta = `/uploads/${this.contador}-${archivo.originalname ?? "imagen"}`;
    this.archivados.push(ruta);
    return ruta;
  }

  async eliminar(rutaPublica) {
    this.eliminados.push(rutaPublica);
  }
}
