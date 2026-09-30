/**
 * Opciones de ordenamiento admitidas por el listado de productos.
 * Es una lista blanca: evita interpolar texto libre en el ORDER BY.
 */
export const ORDEN_PRODUCTO = Object.freeze({
  RECIENTES: "recientes",
  NOMBRE_ASC: "nombre_asc",
  NOMBRE_DESC: "nombre_desc",
  PRECIO_VENTA_ASC: "precio_venta_asc",
  PRECIO_VENTA_DESC: "precio_venta_desc",
});

export const ORDENES_PRODUCTO = Object.values(ORDEN_PRODUCTO);

/** Traducción de la opción pública a la columna y dirección de TypeORM. */
const COLUMNAS_POR_ORDEN = {
  [ORDEN_PRODUCTO.RECIENTES]: { creadoEn: "DESC" },
  [ORDEN_PRODUCTO.NOMBRE_ASC]: { nombre: "ASC" },
  [ORDEN_PRODUCTO.NOMBRE_DESC]: { nombre: "DESC" },
  [ORDEN_PRODUCTO.PRECIO_VENTA_ASC]: { precioVenta: "ASC" },
  [ORDEN_PRODUCTO.PRECIO_VENTA_DESC]: { precioVenta: "DESC" },
};

/**
 * @param {string} [orden]
 * @returns {Record<string, "ASC"|"DESC">}
 */
export const columnaDeOrden = (orden) => COLUMNAS_POR_ORDEN[orden] ?? COLUMNAS_POR_ORDEN[ORDEN_PRODUCTO.RECIENTES];
