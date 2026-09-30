/**
 * Controlador de CU-04. El userId siempre proviene del token de sesión.
 */
export class UsuarioController {
  /**
   * @param {{ usuarioService: import("../services/usuario.service.js").UsuarioService }} dependencias
   */
  constructor({ usuarioService }) {
    this.usuarioService = usuarioService;
  }

  /** GET /api/usuarios/mi-perfil */
  obtenerPerfil = async (req, res) => {
    const perfil = await this.usuarioService.obtenerPerfil(req.usuario.id);
    return res.status(200).json(perfil);
  };

  /** PATCH /api/usuarios/mi-perfil */
  actualizarPerfil = async (req, res) => {
    const usuario = await this.usuarioService.actualizarPerfil(req.usuario.id, req.body);
    return res.status(200).json(usuario);
  };

  /** DELETE /api/usuarios/mi-perfil */
  eliminarCuenta = async (req, res) => {
    const { mensaje } = await this.usuarioService.eliminarCuenta(req.usuario.id);
    return res.status(200).json({ mensaje });
  };
}
