import { z } from "zod";

export const LIMITE_IMAGEN_BYTES = 5 * 1024 * 1024;
export const TIPOS_IMAGEN = ["image/jpeg", "image/png", "image/webp"];

/**
 * Precio obligatorio: texto con hasta 2 decimales que se transforma a número.
 * Acepta coma o punto como separador decimal, en línea con el backend.
 */
const precioSchema = z
  .union([z.string(), z.number()], { error: "El precio es obligatorio" })
  .transform((valor) => String(valor).trim().replace(",", "."))
  .refine(
    (valor) => /^\d+(\.\d{1,2})?$/.test(valor),
    "Ingresa un número positivo con hasta 2 decimales",
  )
  .transform(Number)
  .refine((valor) => valor > 0, "El precio debe ser mayor que cero");

export const productoSchema = z.object({
  nombre: z
    .string({ error: "El nombre es obligatorio" })
    .trim()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100, "El nombre no puede superar los 100 caracteres"),
  descripcion: z
    .string()
    .trim()
    .max(500, "La descripción no puede superar los 500 caracteres")
    .optional()
    .or(z.literal("")),
  categoriaId: z.coerce
    .number({ error: "La categoría es obligatoria" })
    .int("La categoría no es válida")
    .positive("Selecciona una categoría"),
  precioProveedor: precioSchema,
  precioVenta: precioSchema,
  imagen: z
    .custom<File>((valor) => valor === undefined || valor === null || valor instanceof File, {
      message: "La imagen no es válida",
    })
    .optional()
    .refine((archivo) => !archivo || archivo.size <= LIMITE_IMAGEN_BYTES, {
      message: "La imagen no puede superar los 5 MB",
    })
    .refine((archivo) => !archivo || TIPOS_IMAGEN.includes(archivo.type), {
      message: "Solo se admiten imágenes JPG, PNG o WebP",
    }),
});

/** En la edición solo se validan los campos presentes en el formulario. */
export const productoParcialSchema = z
  .object({
    nombre: productoSchema.shape.nombre.optional(),
    descripcion: productoSchema.shape.descripcion,
    categoriaId: productoSchema.shape.categoriaId.optional(),
    precioProveedor: precioSchema.optional(),
    precioVenta: precioSchema.optional(),
    imagen: productoSchema.shape.imagen,
  })
  .refine(
    (valores) =>
      valores.nombre !== undefined ||
      valores.descripcion !== undefined ||
      valores.categoriaId !== undefined ||
      valores.precioProveedor !== undefined ||
      valores.precioVenta !== undefined ||
      Boolean(valores.imagen),
    { message: "Modifica al menos un campo para guardar los cambios" },
  );

/** Lo que el formulario captura: los precios llegan como texto. */
export type FormularioProducto = z.input<typeof productoSchema>;
/** Lo que el esquema entrega tras validar: precios ya numéricos. */
export type DatosProducto = z.output<typeof productoSchema>;
export type FormularioProductoParcial = z.input<typeof productoParcialSchema>;
export type DatosProductoParcial = z.output<typeof productoParcialSchema>;
