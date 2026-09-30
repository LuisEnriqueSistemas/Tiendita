import { UsuarioRepositoryInterface } from "../repositories/usuario.repository.interface.js";

/**
 * Implementación en memoria del contrato de usuarios para pruebas unitarias.
 * Evita cualquier dependencia de red o base de datos real.
 */
export class UsuarioRepositoryFake extends UsuarioRepositoryInterface {
  /**
   * @param {object[]} [usuarios] Usuarios iniciales.
   */
  constructor(usuarios = []) {
    super();
    this.usuarios = new Map();
    this.ultimoSecuencia = 0;
    usuarios.forEach((usuario) => {
      this.ultimoSecuencia += 1;
      this.usuarios.set(usuario.id ?? this.ultimoSecuencia, {
        activo: true,
        eliminadoEn: null,
        resetToken: null,
        resetTokenExpiresAt: null,
        creadoEn: new Date(),
        actualizadoEn: new Date(),
        ...usuario,
      });
    });
    this.ultimoSecuencia = Math.max(this.ultimoSecuencia, ...[...this.usuarios.keys()], 0);
  }

  async buscarPorEmail(email) {
    return this.#buscar((usuario) => usuario.email === email);
  }

  async buscarPorId(id) {
    return this.#buscar((usuario) => usuario.id === id);
  }

  async crear({ nombre, email, passwordHash, ...resto }) {
    this.ultimoSecuencia += 1;
    const usuario = {
      id: this.ultimoSecuencia,
      nombre,
      email,
      passwordHash,
      activo: true,
      eliminadoEn: null,
      resetToken: null,
      resetTokenExpiresAt: null,
      creadoEn: new Date(),
      actualizadoEn: new Date(),
      ...resto,
    };
    this.usuarios.set(usuario.id, usuario);
    return usuario;
  }

  async actualizar(id, cambios) {
    const usuario = this.usuarios.get(id);
    if (!usuario) return null;
    const actualizado = { ...usuario, ...cambios, actualizadoEn: new Date() };
    this.usuarios.set(id, actualizado);
    return actualizado;
  }

  async actualizarPassword(id, passwordHash) {
    await this.actualizar(id, { passwordHash });
  }

  async guardarResetToken(id, { token, expiraEn }) {
    await this.actualizar(id, { resetToken: token, resetTokenExpiresAt: expiraEn });
  }

  async limpiarResetToken(id) {
    await this.actualizar(id, { resetToken: null, resetTokenExpiresAt: null });
  }

  async eliminar(id) {
    return this.actualizar(id, {
      activo: false,
      eliminadoEn: new Date(),
      resetToken: null,
      resetTokenExpiresAt: null,
    });
  }

  #buscar(predicado) {
    return [...this.usuarios.values()].find(predicado) ?? null;
  }
}
