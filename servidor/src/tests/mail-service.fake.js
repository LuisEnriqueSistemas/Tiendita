import { MailServiceInterface } from "../services/mail.service.js";

/**
 * Servicio de correo en memoria: registra los envíos para poder verificarlos.
 */
export class MailServiceFake extends MailServiceInterface {
  constructor() {
    super();
    this.envios = [];
    this.fallar = false;
  }

  async enviarRecuperacionContrasena(datos) {
    if (this.fallar) throw new Error("SMTP no disponible");
    this.envios.push(datos);
  }
}
