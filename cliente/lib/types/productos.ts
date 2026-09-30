export type Categoria = {
  id: number;
  nombre: string;
  descripcion: string | null;
};

/** La categoría que el backend incluye dentro de un producto solo trae id y nombre. */
export type CategoriaProducto = Pick<Categoria, "id" | "nombre">;

export type Producto = {
  id: number;
  nombre: string;
  descripcion: string | null;
  precioProveedor: number;
  precioVenta: number;
  margen: number;
  imagen: string | null;
  imagenUrl: string | null;
  activo: boolean;
  categoria: CategoriaProducto | null;
  creadoEn?: string;
  actualizadoEn?: string;
};

export type Paginacion = {
  total: number;
  pagina: number;
  limite: number;
  totalPaginas: number;
};

export type ListadoProductos = {
  productos: Producto[];
  paginacion: Paginacion;
};

export type ResumenProductos = {
  totalProductos: number;
  totalCategorias: number;
  valorInventario: number;
};

/** Órdenes aceptados por el backend (lista blanca). */
export const ORDENES_PRODUCTO = [
  "recientes",
  "nombre_asc",
  "nombre_desc",
  "precio_venta_asc",
  "precio_venta_desc",
] as const;

export type OrdenProducto = (typeof ORDENES_PRODUCTO)[number];

export const ETIQUETAS_ORDEN: Record<OrdenProducto, string> = {
  recientes: "Más recientes",
  nombre_asc: "Nombre (A-Z)",
  nombre_desc: "Nombre (Z-A)",
  precio_venta_asc: "Precio de venta (menor a mayor)",
  precio_venta_desc: "Precio de venta (mayor a menor)",
};

export type FiltrosProductos = {
  nombre: string;
  categoriaId: number | null;
  orden: OrdenProducto;
  pagina: number;
  limite: number;
};

export type DtoProducto = {
  nombre: string;
  descripcion: string;
  categoriaId: number;
  precioProveedor: number;
  precioVenta: number;
  imagen?: File | null;
};
