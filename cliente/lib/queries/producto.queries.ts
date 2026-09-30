"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import * as productoService from "@/lib/services/producto.service";
import { useAuthStore } from "@/lib/stores/auth.store";
import { FILTROS_INICIALES, useFiltrosStore } from "@/lib/stores/filtros.store";
import type { DtoProducto, FiltrosProductos, ListadoProductos } from "@/lib/types/productos";

/** CU-05: clave de caché del listado. La comparten la query y la mutación de baja. */
export const claveListadoProductos = (filtros: FiltrosProductos) =>
  [
    "productos",
    filtros.nombre,
    filtros.categoriaId,
    filtros.orden,
    filtros.pagina,
    filtros.limite,
  ] as const;

/** CU-05: listado filtrado y paginado del catálogo. */
export const useProductos = () => {
  const token = useAuthStore((estado) => estado.token);
  const nombre = useFiltrosStore((estado) => estado.nombre);
  const categoriaId = useFiltrosStore((estado) => estado.categoriaId);
  const orden = useFiltrosStore((estado) => estado.orden);
  const pagina = useFiltrosStore((estado) => estado.pagina);
  const limite = useFiltrosStore((estado) => estado.limite);
  const filtros: FiltrosProductos = { nombre, categoriaId, orden, pagina, limite };

  return useQuery({
    queryKey: claveListadoProductos(filtros),
    queryFn: ({ signal }) => productoService.listarProductos(token as string, filtros, signal),
    enabled: Boolean(token),
    placeholderData: (anterior) => anterior,
  });
};

/** CU-06: detalle de un producto. */
export const useProducto = (id: number) => {
  const token = useAuthStore((estado) => estado.token);

  return useQuery({
    queryKey: ["productos", "detalle", id],
    queryFn: ({ signal }) => productoService.obtenerProducto(token as string, id, signal),
    enabled: Boolean(token) && Number.isFinite(id) && id > 0,
  });
};

/** CU-09: indicadores del dashboard. */
export const useResumenProductos = () => {
  const token = useAuthStore((estado) => estado.token);

  return useQuery({
    queryKey: ["productos", "resumen"],
    queryFn: ({ signal }) => productoService.obtenerResumen(token as string, signal),
    enabled: Boolean(token),
    staleTime: 30_000,
  });
};

/** Invalida listados, detalle y resumen tras cualquier escritura. */
const useInvalidarProductos = () => {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: ["productos"] });
  };
};

/** CU-07: alta de producto. */
export const useCrearProducto = () => {
  const invalidar = useInvalidarProductos();

  return useMutation({
    mutationFn: (dto: DtoProducto) => {
      const { token } = useAuthStore.getState();
      return productoService.crearProducto(token as string, dto);
    },
    onSuccess: (producto) => {
      invalidar();
      useFiltrosStore.getState().reiniciar();
      toast.success(`"${producto.nombre}" se registró correctamente`);
    },
    onError: (error: Error) => toast.error(error.message),
  });
};

/** CU-08: edición de producto. */
export const useActualizarProducto = () => {
  const queryClient = useQueryClient();
  const invalidar = useInvalidarProductos();

  return useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: Partial<DtoProducto> }) => {
      const { token } = useAuthStore.getState();
      return productoService.actualizarProducto(token as string, id, dto);
    },
    onSuccess: (producto) => {
      queryClient.setQueryData(["productos", "detalle", producto.id], producto);
      invalidar();
      toast.success(`"${producto.nombre}" se actualizó correctamente`);
    },
    onError: (error: Error) => toast.error(error.message),
  });
};

/** CU-09: baja lógica de producto. */
export const useEliminarProducto = () => {
  const queryClient = useQueryClient();
  const invalidar = useInvalidarProductos();

  return useMutation({
    mutationFn: (id: number) => {
      const { token } = useAuthStore.getState();
      return productoService.eliminarProducto(token as string, id);
    },
    onSuccess: (respuesta, id) => {
      // Solo se consulta el listado de los filtros actuales: el resto de la caché
      // bajo ["productos"] tiene otras formas (resumen, detalle) sin paginación.
      const { nombre, categoriaId, orden, pagina, limite } = useFiltrosStore.getState();
      const listado = queryClient.getQueryData<ListadoProductos>(
        claveListadoProductos({ nombre, categoriaId, orden, pagina, limite }),
      );

      // El total cacheado todavía cuenta el producto borrado: se descuenta para
      // no dejar al usuario en una página que ya no existe. Sin listado en caché
      // no hay total del que fiarse, así que la página se respeta tal cual.
      if (listado) {
        const totalRestante = Math.max(0, listado.paginacion.total - 1);
        const ultimaPagina = limite > 0 ? Math.max(1, Math.ceil(totalRestante / limite)) : 1;
        if (pagina > ultimaPagina) useFiltrosStore.setState({ pagina: ultimaPagina });
      }

      // El detalle de un producto dado de baja ya no debe quedar en caché.
      queryClient.removeQueries({ queryKey: ["productos", "detalle", id] });
      invalidar();
      toast.success(respuesta.mensaje);
    },
    onError: (error: Error) => toast.error(error.message),
  });
};

export { FILTROS_INICIALES };
