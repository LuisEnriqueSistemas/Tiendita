import nodemailer from "nodemailer";

/**
 * Contrato de envío de correos (CU-03).
 */
export class MailServiceInterface {
  /**
   * @param {{ email: string, nombre: string, enlace: string }} datos
   * @returns {Promise<void>}
   */
  // eslint-disable-next-line no-unused-vars
  async enviarRecuperacionContrasena(datos) {
    throw new Error("No implementado");
  }
}

const construirMensajeRecuperacion = ({ nombre, enlace }) => ({
  subject: "Recuperación de contraseña",
  text: `Hola ${nombre},\n\nPara establecer una nueva contraseña accede al siguiente enlace:\n${enlace}\n\nSi no solicitaste este cambio, ignora este mensaje.`,
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto;">
      <h2 style="color: #1d4ed8;">Recuperación de contraseña</h2>
      <p>Hola ${nombre},</p>
      <p>Para establecer una nueva contraseña en tu cuenta, haz clic en el siguiente enlace:</p>
      <p>
        <a href="${enlace}" style="background:#1d4ed8;color:#ffffff;padding:12px 20px;border-radius:8px;text-decoration:none;">
          Restablecer contraseña
        </a>
      </p>
      <p style="color:#64748b;font-size:12px;">
        Si el botón no funciona, copia este enlace en tu navegador:<br />
        ${enlace}
      </p>
      <p style="color:#64748b;font-size:12px;">Si no solicitaste este cambio, ignora este mensaje.</p>
    </div>
  `,
});

export class NodemailerMailService extends MailServiceInterface {
  /**
   * @param {{ host: string, port: number, secure: boolean, user: string, pass: string, from: string, transport?: object }} opciones
   */
  constructor({ host, port, secure, user, pass, from, transport }) {
    super();
    this.from = from;
    this.transport =
      transport ?? nodemailer.createTransport({ host, port, secure, auth: { user, pass } });
  }

  /**
   * @param {{ email: string, nombre: string, enlace: string }} datos
   */
  async enviarRecuperacionContrasena(datos) {
    const { subject, text, html } = construirMensajeRecuperacion(datos);
    await this.transport.sendMail({ from: this.from, to: datos.email, subject, text, html });
  }
}
