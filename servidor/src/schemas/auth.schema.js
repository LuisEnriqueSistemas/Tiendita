import { z } from "zod";
import { MIN_PASSWORD_LENGTH } from "../constants/password-policy.js";

const correoValido = z.email({ error: "El correo electrónico no tiene un formato válido" });

export const registroSchema = z
  .object({
    nombre: z
      .string({ error: "El nombre es obligatorio" })
      .trim()
      .min(2, { error: "El nombre debe tener al menos 2 caracteres" })
      .max(150, { error: "El nombre no puede superar los 150 caracteres" }),
    email: correoValido,
    password: z
      .string({ error: "La contraseña es obligatoria" })
      .min(MIN_PASSWORD_LENGTH, {
        error: `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres`,
      })
      .max(72, { error: "La contraseña no puede superar los 72 caracteres" }),
  })
  .strict();

export const loginSchema = z
  .object({
    email: correoValido,
    password: z.string({ error: "La contraseña es obligatoria" }).min(1, {
      error: "La contraseña es obligatoria",
    }),
  })
  .strict();

export const recuperarContrasenaSchema = z.object({ email: correoValido }).strict();

export const restablecerContrasenaSchema = z
  .object({
    token: z.string({ error: "El token es obligatorio" }).min(1, { error: "El token es obligatorio" }),
    password: z
      .string({ error: "La contraseña es obligatoria" })
      .min(MIN_PASSWORD_LENGTH, {
        error: `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres`,
      })
      .max(72, { error: "La contraseña no puede superar los 72 caracteres" }),
  })
  .strict();

export const validarTokenRecuperacionSchema = z
  .object({
    token: z.string({ error: "El token es obligatorio" }).min(1, { error: "El token es obligatorio" }),
  })
  .strict();
