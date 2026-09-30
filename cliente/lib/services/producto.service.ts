import { apiRequest, construirQuery } from "@/lib/api/client";
import type { RespuestaMensaje } from "@/lib/types/cuentas";
import type {
  DtoProducto,
  FiltrosProductos,
  ListadoProductos,
  Producto,
  ResumenProductos,
} from "@/lib/types/productos";

/** CU-05: lista productos aplicando búsqueda por nombre, categoría, orden y paginación. */
export const listarProductos = (token: string, filtros: FiltrosProductos, signal?: AbortSignal) =>
  apiRequest<ListadoProductos>(
    `/productos${construirQuery({
      nombre: filtros.nombre.trim() || undefined,
      categoriaId: filtros.categoriaId ?? undefined,
      orden: filtros.orden,
      pagina: filtros.pagina,
      limite: filtros.limite,
    })}`,
    { token, signal },
  );

/** CU-06: detalle de un producto. */
export const obtenerProducto = (token: string, id: number, signal?: AbortSignal) =>
  apiRequest<Producto>(`/productos/${id}`, { token, signal });

/** CU-09: indicadores del dashboard. */
export const obtenerResumen = (token: string, signal?: AbortSignal) =>
  apiRequest<ResumenProductos>("/productos/resumen", { token, signal });

/** Convierte el DTO del formulario en `multipart/form-data`. */
const aFormulario = (dto: DtoProducto): FormData => {
  const formulario = new FormData();
  formulario.set("nombre", dto.nombre);
  formulario.set("descripcion", dto.descripcion);
  formulario.set("categoriaId", String(dto.categoriaId));
  formulario.set("precioProveedor", String(dto.precioProveedor));
  formulario.set("precioVenta", String(dto.precioVenta));
  if (dto.imagen) formulario.set("imagen", dto.imagen);
  return formulario;
};

/** En la edición solo se envían los campos presentes: el backend exige al menos uno. */
const aFormularioParcial = (dto: Partial<DtoProducto>): FormData => {
  const formulario = new FormData();
  if (dto.nombre !== undefined) formulario.set("nombre", dto.nombre);
  if (dto.descripcion !== undefined) formulario.set("descripcion", dto.descripcion);
  if (dto.categoriaId !== undefined) formulario.set("categoriaId", String(dto.categoriaId));
  if (dto.precioProveedor !== undefined) formulario.set("precioProveedor", String(dto.precioProveedor));
  if (dto.precioVenta !== undefined) formulario.set("precioVenta", String(dto.precioVenta));
  if (dto.imagen) formulario.set("imagen", dto.imagen);
  return formulario;
};

/** CU-07: registra un producto con imagen opcional. */
export const crearProducto = (token: string, dto: DtoProducto) =>
  apiRequest<Producto>("/productos", { method: "POST", body: aFormulario(dto), token });

/** CU-08: actualiza los campos enviados; la imagen es opcional. */
export const actualizarProducto = (token: string, id: number, dto: Partial<DtoProducto>) =>
  apiRequest<Producto>(`/productos/${id}`, {
    method: "PATCH",
    body: aFormularioParcial(dto),
    token,
  });

/** CU-09: baja lógica del producto. */
export const eliminarProducto = (token: string, id: number) =>
  apiRequest<RespuestaMensaje>(`/productos/${id}`, { method: "DELETE", token });
