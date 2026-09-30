import { Usuario } from "../entities/Usuario.js";
import { UsuarioRepositoryInterface } from "./usuario.repository.interface.js";

/**
 * Implementación del contrato de usuarios sobre TypeORM.
 * No contiene lógica de negocio: solo acceso a datos.
 */
export class UsuarioTypeOrmRepository extends UsuarioRepositoryInterface {
  /**
   * @param {import("typeorm").DataSource} dataSource
   */
  constructor(dataSource) {
    super();
    this.repository = dataSource.getRepository(Usuario);
  }

  async buscarPorEmail(email) {
    return this.repository.findOne({ where: { email } });
  }

  async buscarPorId(id) {
    return this.repository.findOne({ where: { id } });
  }

  async crear({ nombre, email, passwordHash }) {
    const usuario = this.repository.create({ nombre, email, passwordHash, activo: true });
    return this.repository.save(usuario);
  }

  async actualizar(id, cambios) {
    const usuario = await this.repository.findOne({ where: { id } });
    if (!usuario) return null;
    Object.assign(usuario, cambios);
    return this.repository.save(usuario);
  }

  async actualizarPassword(id, passwordHash) {
    await this.repository.update({ id }, { passwordHash });
  }

  async guardarResetToken(id, { token, expiraEn }) {
    await this.repository.update({ id }, { resetToken: token, resetTokenExpiresAt: expiraEn });
  }

  async limpiarResetToken(id) {
    await this.repository.update({ id }, { resetToken: null, resetTokenExpiresAt: null });
  }

  async eliminar(id) {
    const usuario = await this.repository.findOne({ where: { id } });
    if (!usuario) return null;
    usuario.activo = false;
    usuario.eliminadoEn = new Date();
    usuario.resetToken = null;
    usuario.resetTokenExpiresAt = null;
    return this.repository.save(usuario);
  }
}
