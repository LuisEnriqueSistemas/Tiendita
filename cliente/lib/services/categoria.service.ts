import { apiRequest } from "@/lib/api/client";
import type { Categoria } from "@/lib/types/productos";

/** CU-01: consulta el catálogo fijo de categorías. */
export const listarCategorias = (token: string, signal?: AbortSignal) =>
  apiRequest<{ categorias: Categoria[] }>("/categorias", { token, signal });

/** CU-01: consulta el detalle de una categoría. */
export const obtenerCategoria = (token: string, id: number) =>
  apiRequest<Categoria>(`/categorias/${id}`, { token });
