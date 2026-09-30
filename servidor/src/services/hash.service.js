import bcrypt from "bcryptjs";

/**
 * Contrato de cifrado y comparación de contraseñas (BCrypt).
 */
export class HashServiceInterface {
  /**
   * @param {string} password
   * @returns {Promise<string>}
   */
  // eslint-disable-next-line no-unused-vars
  async hash(password) {
    throw new Error("No implementado");
  }

  /**
   * @param {string} password
   * @param {string} hash
   * @returns {Promise<boolean>}
   */
  // eslint-disable-next-line no-unused-vars
  async compare(password, hash) {
    throw new Error("No implementado");
  }
}

export class BcryptHashService extends HashServiceInterface {
  /**
   * @param {number} saltRounds
   */
  constructor(saltRounds = 10) {
    super();
    this.saltRounds = saltRounds;
  }

  async hash(password) {
    return bcrypt.hash(password, this.saltRounds);
  }

  async compare(password, hash) {
    if (!hash) return false;
    return bcrypt.compare(password, hash);
  }
}
