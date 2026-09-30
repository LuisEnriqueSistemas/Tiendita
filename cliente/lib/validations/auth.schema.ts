import { z } from "zod";

export const MIN_PASSWORD_LENGTH = 8;

const correoValido = z.email("El correo electrónico no tiene un formato válido");

const password = z
  .string()
  .min(1, "La contraseña es obligatoria")
  .min(MIN_PASSWORD_LENGTH, `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres`);

export const loginSchema = z.object({
  email: correoValido,
  password: z.string().min(1, "La contraseña es obligatoria"),
});

export const registroSchema = z.object({
  nombre: z
    .string()
    .min(1, "El nombre es obligatorio")
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(150, "El nombre no puede superar los 150 caracteres"),
  email: correoValido,
  password,
});

export const recuperarContrasenaSchema = z.object({
  email: correoValido,
});

export const restablecerContrasenaSchema = z
  .object({
    password,
    confirmacion: z.string().min(1, "Confirma tu nueva contraseña"),
  })
  .refine((datos) => datos.password === datos.confirmacion, {
    message: "Las contraseñas no coinciden",
    path: ["confirmacion"],
  });

export type FormularioLogin = z.infer<typeof loginSchema>;
export type FormularioRegistro = z.infer<typeof registroSchema>;
export type FormularioRecuperar = z.infer<typeof recuperarContrasenaSchema>;
export type FormularioRestablecer = z.infer<typeof restablecerContrasenaSchema>;
