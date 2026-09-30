import { apiRequest } from "@/lib/api/client";
import type { DtoActualizarPerfil, RespuestaMensaje, Usuario } from "@/lib/types/cuentas";

/** CU-04: consulta los datos del usuario autenticado. */
export const obtenerPerfil = (token: string) =>
  apiRequest<Usuario>("/usuarios/mi-perfil", { token });

/** CU-04: actualiza nombre, correo o contraseña. */
export const actualizarPerfil = (token: string, dto: DtoActualizarPerfil) =>
  apiRequest<Usuario>("/usuarios/mi-perfil", { method: "PATCH", body: dto, token });

/** CU-04: realiza la baja lógica de la cuenta. */
export const eliminarCuenta = (token: string) =>
  apiRequest<RespuestaMensaje>("/usuarios/mi-perfil", { method: "DELETE", token });
