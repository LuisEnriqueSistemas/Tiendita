import { apiRequest } from "@/lib/api/client";
import type {
  DtoLogin,
  DtoRecuperarContrasena,
  DtoRegistro,
  DtoRestablecerContrasena,
  RespuestaMensaje,
  Sesion,
} from "@/lib/types/cuentas";

/** CU-01: registra una cuenta nueva. */
export const registrar = (dto: DtoRegistro) =>
  apiRequest<{ mensaje: string; data: Sesion["user"] }>("/auth/registro", {
    method: "POST",
    body: dto,
  });

/** CU-02: autentica y devuelve la sesión. */
export const iniciarSesion = (dto: DtoLogin) =>
  apiRequest<Sesion>("/auth/login", { method: "POST", body: dto });

/** CU-03: solicita el envío del enlace de recuperación. */
export const solicitarRecuperacion = (dto: DtoRecuperarContrasena) =>
  apiRequest<RespuestaMensaje>("/auth/recuperar-contrasena", { method: "POST", body: dto });

/** CU-03: comprueba la vigencia del enlace recibido por correo. */
export const validarTokenRecuperacion = (token: string) =>
  apiRequest<{ valido: boolean; email: string }>(
    `/auth/validar-token-recuperacion?token=${encodeURIComponent(token)}`,
  );

/** CU-03: establece la nueva contraseña. */
export const restablecerContrasena = (dto: DtoRestablecerContrasena) =>
  apiRequest<RespuestaMensaje>("/auth/restablecer-contrasena", { method: "POST", body: dto });
