import { z } from "zod";
import { MIN_PASSWORD_LENGTH } from "../constants/password-policy.js";

export const actualizarPerfilSchema = z
  .object({
    nombre: z
      .string({ error: "El nombre no puede estar vacío" })
      .trim()
      .min(2, { error: "El nombre debe tener al menos 2 caracteres" })
      .max(150, { error: "El nombre no puede superar los 150 caracteres" })
      .optional(),
    email: z.email({ error: "El correo electrónico no tiene un formato válido" }).optional(),
    password: z
      .string()
      .min(MIN_PASSWORD_LENGTH, {
        error: `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres`,
      })
      .max(72, { error: "La contraseña no puede superar los 72 caracteres" })
      .optional(),
  })
  .strict()
  .refine((datos) => Object.keys(datos).length > 0, {
    error: "Debes enviar al menos un campo para actualizar",
  });
