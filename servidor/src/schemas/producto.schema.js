import { z } from "zod";
import { ORDENES_PRODUCTO, ORDEN_PRODUCTO } from "../constants/orden-productos.js";

/** En las query strings Express 5 un parámetro repetido llega como arreglo. */
const primerValor = (valor) => (Array.isArray(valor) ? valor[0] : valor);

/** Un filtro vacío (`?categoriaId=`) se trata como filtro no aplicado. */
const vacioAIndefinido = (valor) => {
  const unico = primerValor(valor);
  return typeof unico === "string" && unico.trim() === "" ? undefined : unico;
};

/**
 * Precio obligatorio: texto con hasta 2 decimales que se transforma a número.
 * Acepta coma o punto como separador decimal, habitual en formularios en español.
 * @param {string} etiqueta Nombre del campo para los mensajes de error.
 */
const precioPositivo = (etiqueta) =>
  z
    .string({ error: `El ${etiqueta} es obligatorio` })
    .trim()
    .regex(/^\d+([.,]\d{1,2})?$/, {
      error: `El ${etiqueta} debe ser un número positivo con hasta 2 decimales`,
    })
    .transform((valor) => Number(valor.replace(",", ".")))
    .refine((valor) => valor > 0, { error: `El ${etiqueta} debe ser mayor que cero` });

/**
 * Número recibido como texto (query string o multipart) y convertido a entero positivo.
 * @param {string} [error] Mensaje para un valor ausente o no numérico.
 */
const enteroPositivo = (error) =>
  z.coerce.number({ error: error ?? "Debe ser un número" }).int("Debe ser un número entero").positive("Debe ser mayor que cero");

const categoriaIdSchema = z.preprocess(vacioAIndefinido, enteroPositivo("La categoría es obligatoria"));

const camposProducto = {
  nombre: z
    .string({ error: "El nombre es obligatorio" })
    .trim()
    .min(2, { error: "El nombre debe tener al menos 2 caracteres" })
    .max(100, { error: "El nombre no puede superar los 100 caracteres" }),
  descripcion: z
    .string()
    .trim()
    .max(500, { error: "La descripción no puede superar los 500 caracteres" })
    .nullish()
    .transform((valor) => (valor ? valor : null)),
  precioProveedor: precioPositivo("precio del proveedor"),
  precioVenta: precioPositivo("precio de venta"),
  categoriaId: categoriaIdSchema,
};

/** CU-05: alta de producto. La imagen viaja aparte en multipart. */
export const crearProductoSchema = z.object(camposProducto).strict();

/**
 * CU-07: edición parcial. Todos los campos son opcionales.
 * La regla "al menos un campo" vive en el servicio porque depende de si
 * además de campos se envió un archivo de imagen (que no viaja en el cuerpo).
 */
export const actualizarProductoSchema = z
  .object({
    nombre: camposProducto.nombre.optional(),
    descripcion: camposProducto.descripcion.optional(),
    precioProveedor: z.preprocess(vacioAIndefinido, precioPositivo("precio del proveedor")).optional(),
    precioVenta: z.preprocess(vacioAIndefinido, precioPositivo("precio de venta")).optional(),
    categoriaId: categoriaIdSchema.optional(),
  })
  .strict();

/** CU-06: filtros de búsqueda del listado. */
export const filtrosProductosSchema = z
  .object({
    nombre: z.preprocess(
      vacioAIndefinido,
      z
        .string()
        .trim()
        .min(2, { error: "La búsqueda debe tener al menos 2 caracteres" })
        .max(100, { error: "La búsqueda no puede superar los 100 caracteres" }),
    ),
    categoriaId: categoriaIdSchema.optional(),
    pagina: z.preprocess(vacioAIndefinido, enteroPositivo("La página debe ser un número")),
    limite: z
      .preprocess(vacioAIndefinido, enteroPositivo("El límite debe ser un número"))
      .refine((valor) => valor <= 100, { error: "El límite no puede superar los 100 registros" }),
    orden: z.preprocess(
      vacioAIndefinido,
      z.enum(ORDENES_PRODUCTO, {
        error: `El orden debe ser uno de: ${ORDENES_PRODUCTO.join(", ")}`,
      }),
    ),
  })
  .strict()
  .partial();

/** Identificador de producto en la ruta. */
export const idProductoParamSchema = z.object({
  id: z.coerce
    .number({ error: "El identificador del producto debe ser un número" })
    .int("El identificador del producto debe ser un entero")
    .positive("El identificador del producto debe ser mayor que cero"),
});

/** Valor por defecto del orden cuando el cliente no lo especifica. */
export const ORDEN_POR_DEFECTO = ORDEN_PRODUCTO.RECIENTES;
