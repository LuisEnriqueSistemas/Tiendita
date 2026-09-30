import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { toast } from "sonner";
import { claveListadoProductos, useEliminarProducto } from "@/lib/queries/producto.queries";
import { eliminarProducto } from "@/lib/services/producto.service";
import { useAuthStore } from "@/lib/stores/auth.store";
import { FILTROS_INICIALES, useFiltrosStore } from "@/lib/stores/filtros.store";
import type { FiltrosProductos, ListadoProductos, Producto } from "@/lib/types/productos";
import type { ReactNode } from "react";

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

vi.mock("@/lib/services/producto.service", () => ({
  listarProductos: vi.fn(),
  obtenerProducto: vi.fn(),
  obtenerResumen: vi.fn(),
  crearProducto: vi.fn(),
  actualizarProducto: vi.fn(),
  eliminarProducto: vi.fn(),
}));

const producto: Producto = {
  id: 7,
  nombre: "Gaseosa cola 2L",
  descripcion: "Bebida gaseosa",
  precioProveedor: 1500,
  precioVenta: 3200,
  margen: 1700,
  imagen: null,
  imagenUrl: null,
  activo: true,
  categoria: { id: 1, nombre: "Bebidas" },
};

/** Cliente con `gcTime` alto para que la caché sembrada sobreviva a la prueba. */
const crearCliente = () =>
  new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity }, mutations: { retry: false } },
  });

/**
 * Siembra el catálogo con las tres formas que conviven bajo la clave `["productos"]`:
 * el listado paginado, el resumen del dashboard y el detalle de un producto. El resumen
 * y el detalle no tienen `paginacion`, que es justo lo que rompía la baja.
 */
const sembrarCatalogo = (filtros: Partial<FiltrosProductos> = {}, total = 2) => {
  const cliente = crearCliente();
  const activos: FiltrosProductos = { ...FILTROS_INICIALES, ...filtros };
  const listado: ListadoProductos = {
    productos: [producto],
    paginacion: {
      total,
      pagina: activos.pagina,
      limite: activos.limite,
      totalPaginas: Math.max(1, Math.ceil(total / activos.limite)),
    },
  };
  cliente.setQueryData(claveListadoProductos(activos), listado);
  cliente.setQueryData(["productos", "resumen"], {
    totalProductos: total,
    totalCategorias: 14,
    valorInventario: 3200,
  });
  cliente.setQueryData(["productos", "detalle", producto.id], producto);
  // El store debe reflejar los filtros con los que se sembró el listado.
  useFiltrosStore.setState(activos);
  return { cliente, activos };
};

const renderizarBaja = (cliente: QueryClient) => {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={cliente}>{children}</QueryClientProvider>
  );
  return renderHook(() => useEliminarProducto(), { wrapper });
};

describe("useEliminarProducto (CU-08)", () => {
  beforeEach(() => {
    useFiltrosStore.setState({ ...FILTROS_INICIALES });
    useAuthStore.setState({ token: "token" });
    vi.mocked(eliminarProducto).mockResolvedValue({
      mensaje: "El producto fue eliminado correctamente",
    });
  });

  it("confirma la baja y notifica aunque la caché tenga resumen y detalle", async () => {
    const { cliente } = sembrarCatalogo();
    const { result } = renderizarBaja(cliente);

    await act(async () => {
      result.current.mutate(producto.id);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    // El toast es la última línea de `onSuccess`: si se cumple, el flujo no se interrumpió.
    expect(toast.success).toHaveBeenCalledWith("El producto fue eliminado correctamente");
    expect(eliminarProducto).toHaveBeenCalledWith("token", producto.id);
  });

  it("invalida el catálogo y descarta el detalle del producto dado de baja", async () => {
    const { cliente, activos } = sembrarCatalogo();
    const espiarInvalidar = vi.spyOn(cliente, "invalidateQueries");

    const { result } = renderizarBaja(cliente);
    await act(async () => {
      result.current.mutate(producto.id);
    });

    await waitFor(() => expect(espiarInvalidar).toHaveBeenCalledWith({ queryKey: ["productos"] }));
    expect(cliente.getQueryData(["productos", "detalle", producto.id])).toBeUndefined();
    // El resumen y el listado solo quedan obsoletos: conservan su caché.
    expect(cliente.getQueryData(["productos", "resumen"])).toBeDefined();
    expect(cliente.getQueryData(claveListadoProductos(activos))).toBeDefined();
  });

  it("retrocede de página cuando el borrado vacía la última página", async () => {
    const { cliente } = sembrarCatalogo({ pagina: 3 }, 25);

    const { result } = renderizarBaja(cliente);
    await act(async () => {
      result.current.mutate(producto.id);
    });

    // Tras la baja quedan 24 productos: 24 / 12 = 2 páginas, no 3.
    await waitFor(() => expect(useFiltrosStore.getState().pagina).toBe(2));
  });

  it("mantiene la página actual cuando el borrado no la deja vacía", async () => {
    const { cliente } = sembrarCatalogo({ pagina: 1 }, 13);

    const { result } = renderizarBaja(cliente);
    await act(async () => {
      result.current.mutate(producto.id);
    });

    // Quedan 12 productos y siguen cabiendo en 1 página.
    await waitFor(() => expect(toast.success).toHaveBeenCalled());
    expect(useFiltrosStore.getState().pagina).toBe(1);
  });

  it("respeta la página actual cuando el listado no está en caché", async () => {
    useFiltrosStore.setState({ pagina: 2 });
    const cliente = crearCliente();

    const { result } = renderizarBaja(cliente);
    await act(async () => {
      result.current.mutate(producto.id);
    });

    await waitFor(() => expect(toast.success).toHaveBeenCalled());
    expect(useFiltrosStore.getState().pagina).toBe(2);
  });

  it("muestra el error del backend sin invalidar la caché", async () => {
    const { cliente } = sembrarCatalogo();
    vi.mocked(eliminarProducto).mockRejectedValue(
      new Error("El producto no existe o está inactivo"),
    );
    const espiarInvalidar = vi.spyOn(cliente, "invalidateQueries");

    const { result } = renderizarBaja(cliente);
    await act(async () => {
      result.current.mutate(producto.id);
    });

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith("El producto no existe o está inactivo"),
    );
    expect(toast.success).not.toHaveBeenCalled();
    expect(espiarInvalidar).not.toHaveBeenCalled();
  });
});
