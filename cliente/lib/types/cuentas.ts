export type DetalleError = {
  campo: string;
  mensaje: string;
};

export type RespuestaError = {
  error: {
    codigo: string;
    mensaje: string;
    detalles: DetalleError[];
  };
};

export type Usuario = {
  id: number;
  nombre: string;
  email: string;
  creadoEn?: string;
};

export type Sesion = {
  access_token: string;
  token_type: "Bearer";
  expires_in: number;
  user: Usuario;
};

export type RespuestaMensaje = {
  mensaje: string;
};

export type DtoRegistro = {
  nombre: string;
  email: string;
  password: string;
};

export type DtoLogin = {
  email: string;
  password: string;
};

export type DtoRecuperarContrasena = {
  email: string;
};

export type DtoRestablecerContrasena = {
  token: string;
  password: string;
};

export type DtoActualizarPerfil = {
  nombre?: string;
  email?: string;
  password?: string;
};
