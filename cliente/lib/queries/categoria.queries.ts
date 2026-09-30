"use client";

import { useQuery } from "@tanstack/react-query";
import * as categoriaService from "@/lib/services/categoria.service";
import { useAuthStore } from "@/lib/stores/auth.store";

/** CU-01: catálogo fijo de categorías. */
export const useCategorias = () => {
  const token = useAuthStore((estado) => estado.token);

  return useQuery({
    queryKey: ["categorias"],
    queryFn: ({ signal }) => categoriaService.listarCategorias(token as string, signal),
    enabled: Boolean(token),
    staleTime: 5 * 60_000,
  });
};
