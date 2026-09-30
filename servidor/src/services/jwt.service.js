import jwt from "jsonwebtoken";

export const PURPOSE_PASSWORD_RESET = "password_reset";

/**
 * Contrato de emisión y verificación de tokens JWT.
 * Cubre la sesión (CU-02) y el token temporal de recuperación (CU-03).
 */
export class JwtServiceInterface {
  /**
   * @param {{ userId: number, email: string }} payload
   * @returns {Promise<string>}
   */
  // eslint-disable-next-line no-unused-vars
  async firmarSesion(payload) {
    throw new Error("No implementado");
  }

  /**
   * @param {string} token
   * @returns {{ userId: number, email: string }}
   */
  // eslint-disable-next-line no-unused-vars
  async verificarSesion(token) {
    throw new Error("No implementado");
  }

  /**
   * @param {{ userId: number }} payload
   * @param {number} ttlMinutes
   * @returns {Promise<string>}
   */
  // eslint-disable-next-line no-unused-vars
  async firmarTokenRecuperacion(payload, ttlMinutes) {
    throw new Error("No implementado");
  }

  /**
   * @param {string} token
   * @returns {{ userId: number, purpose: string }}
   */
  // eslint-disable-next-line no-unused-vars
  async verificarTokenRecuperacion(token) {
    throw new Error("No implementado");
  }
}

export class JsonWebTokenService extends JwtServiceInterface {
  /**
   * @param {{ secret: string, recoverySecret: string, expiresIn: string }} opciones
   */
  constructor({ secret, recoverySecret, expiresIn }) {
    super();
    this.secret = secret;
    this.recoverySecret = recoverySecret;
    this.expiresIn = expiresIn;
  }

  async firmarSesion({ userId, email }) {
    return jwt.sign({ sub: String(userId), email }, this.secret, { expiresIn: this.expiresIn });
  }

  verificarSesion(token) {
    const payload = jwt.verify(token, this.secret);
    return { userId: Number(payload.sub), email: payload.email };
  }

  async firmarTokenRecuperacion({ userId }, ttlMinutes) {
    return jwt.sign({ sub: String(userId), purpose: PURPOSE_PASSWORD_RESET }, this.recoverySecret, {
      expiresIn: `${ttlMinutes}m`,
    });
  }

  verificarTokenRecuperacion(token) {
    const payload = jwt.verify(token, this.recoverySecret);
    if (payload.purpose !== PURPOSE_PASSWORD_RESET) {
      throw new Error("Propósito de token inválido");
    }
    return { userId: Number(payload.sub), purpose: payload.purpose };
  }
}
