import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { FiltrosProductos, OrdenProducto } from "@/lib/types/productos";

type EstadoFiltros = FiltrosProductos & {
  setNombre: (nombre: string) => void;
  setCategoriaId: (categoriaId: number | null) => void;
  setOrden: (orden: OrdenProducto) => void;
  setPagina: (pagina: number) => void;
  reiniciar: () => void;
};

export const FILTROS_INICIALES: FiltrosProductos = {
  nombre: "",
  categoriaId: null,
  orden: "recientes",
  pagina: 1,
  limite: 12,
};

/**
 * Filtros del catálogo. Se persisten para que el usuario no pierda
 * su búsqueda al navegar entre el dashboard y el listado de productos.
 * Cada cambio de filtro vuelve a la primera página.
 */
export const useFiltrosStore = create<EstadoFiltros>()(
  persist(
    (set) => ({
      ...FILTROS_INICIALES,
      setNombre: (nombre) => set({ nombre, pagina: 1 }),
      setCategoriaId: (categoriaId) => set({ categoriaId, pagina: 1 }),
      setOrden: (orden) => set({ orden, pagina: 1 }),
      setPagina: (pagina) => set({ pagina }),
      reiniciar: () => set({ ...FILTROS_INICIALES }),
    }),
    {
      name: "tienda-filtros-productos",
      partialize: (estado) => ({
        nombre: estado.nombre,
        categoriaId: estado.categoriaId,
        orden: estado.orden,
        limite: estado.limite,
      }),
    },
  ),
);
