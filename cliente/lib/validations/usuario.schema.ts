import { z } from "zod";
import { MIN_PASSWORD_LENGTH } from "@/lib/validations/auth.schema";

export const actualizarPerfilSchema = z.object({
  nombre: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(150, "El nombre no puede superar los 150 caracteres"),
  email: z.email("El correo electrónico no tiene un formato válido"),
  password: z.string().optional().refine(
    (valor) => !valor || valor.length >= MIN_PASSWORD_LENGTH,
    `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres`,
  ),
  confirmacion: z.string().optional(),
});

export type FormularioPerfil = z.infer<typeof actualizarPerfilSchema>;
