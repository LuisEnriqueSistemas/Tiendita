/**
 * @param {import("express").Response} res
 * @param {number} status
 * @param {string} mensaje
 * @param {object} [data]
 */
const responder = (res, status, mensaje, data) => {
  const cuerpo = { mensaje, ...(data ? { data } : {}) };
  return res.status(status).json(cuerpo);
};

/**
 * Controlador de CU-01, CU-02 y CU-03.
 * Solo gestiona req/res y delega la lógica de negocio en AuthService.
 */
export class AuthController {
  /**
   * @param {{ authService: import("../services/auth.service.js").AuthService }} dependencias
   */
  constructor({ authService }) {
    this.authService = authService;
  }

  /** POST /api/auth/registro */
  registrar = async (req, res) => {
    const usuario = await this.authService.registrar(req.body);
    return responder(res, 201, "Cuenta registrada correctamente", usuario);
  };

  /** POST /api/auth/login */
  login = async (req, res) => {
    const resultado = await this.authService.autenticar(req.body);
    return res.status(200).json(resultado);
  };

  /** POST /api/auth/recuperar-contrasena */
  recuperarContrasena = async (req, res) => {
    const { mensaje } = await this.authService.solicitarRecuperacion(req.body);
    return res.status(202).json({ mensaje });
  };

  /** GET /api/auth/validar-token-recuperacion */
  validarTokenRecuperacion = async (req, res) => {
    const resultado = await this.authService.validarTokenRecuperacion(req.query.token);
    return res.status(200).json(resultado);
  };

  /** POST /api/auth/restablecer-contrasena */
  restablecerContrasena = async (req, res) => {
    const { mensaje } = await this.authService.restablecerContrasena(req.body);
    return res.status(200).json({ mensaje });
  };
}
