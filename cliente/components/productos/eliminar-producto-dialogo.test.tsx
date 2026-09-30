import { QueryClient } from "@tanstack/react-query";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ListadoProductos } from "@/components/productos/listado-productos";
import { eliminarProducto, listarProductos } from "@/lib/services/producto.service";
import { useAuthStore } from "@/lib/stores/auth.store";
import { FILTROS_INICIALES, useFiltrosStore } from "@/lib/stores/filtros.store";
import type { Producto } from "@/lib/types/productos";
import { renderConProveedores } from "@/tests/render-con-proveedor";

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

vi.mock("@/lib/services/producto.service", () => ({
  listarProductos: vi.fn(),
  obtenerProducto: vi.fn(),
  obtenerResumen: vi.fn(),
  crearProducto: vi.fn(),
  actualizarProducto: vi.fn(),
  eliminarProducto: vi.fn(),
}));

vi.mock("@/lib/services/categoria.service", () => ({
  listarCategorias: vi.fn().mockResolvedValue({
    categorias: [
      { id: 1, nombre: "Bebidas", descripcion: null },
      { id: 2, nombre: "Alimentos", descripcion: null },
    ],
  }),
}));

const crearProducto = (id: number, nombre: string): Producto => ({
  id,
  nombre,
  descripcion: "Descripción del producto",
  precioProveedor: 1500,
  precioVenta: 3200,
  margen: 1700,
  imagen: null,
  imagenUrl: null,
  activo: true,
  categoria: { id: 1, nombre: "Bebidas" },
});

/**
 * Catálogo simulado que se reduce cuando el "backend" confirma la baja.
 * Se siembra además el resumen del dashboard, porque visiting el dashboard es lo
 * que deja esa otra forma bajo la clave `["productos"]` y disparaba el error.
 */
const sembrarCatalogoEnMemoria = (productos: Producto[]) => {
  let catalogo = productos;
  vi.mocked(listarProductos).mockImplementation(async () => ({
    productos: catalogo,
    paginacion: {
      total: catalogo.length,
      pagina: 1,
      limite: 12,
      totalPaginas: Math.max(1, Math.ceil(catalogo.length / 12)),
    },
  }));
  vi.mocked(eliminarProducto).mockImplementation(async (_token: string, id: number) => {
    catalogo = catalogo.filter((producto) => producto.id !== id);
    return { mensaje: "El producto fue eliminado correctamente" };
  });

  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity }, mutations: { retry: false } },
  });
  queryClient.setQueryData(["productos", "resumen"], {
    totalProductos: catalogo.length,
    totalCategorias: 14,
    valorInventario: catalogo.length * 3200,
  });
  return queryClient;
};

describe("Baja de producto en el listado (CU-08)", () => {
  beforeEach(() => {
    useFiltrosStore.setState({ ...FILTROS_INICIALES });
    useAuthStore.setState({ token: "token" });
  });

  it("elimina el producto y lo retira de la grilla", async () => {
    const queryClient = sembrarCatalogoEnMemoria([
      crearProducto(1, "Gaseosa cola 2L"),
      crearProducto(2, "Leche entera 1L"),
    ]);
    const usuario = userEvent.setup();
    renderConProveedores(<ListadoProductos conAcciones />, { queryClient });

    expect(await screen.findByText("Gaseosa cola 2L")).toBeInTheDocument();

    await usuario.click(screen.getByRole("button", { name: "Eliminar Gaseosa cola 2L" }));
    await usuario.click(await screen.findByRole("button", { name: "Sí, eliminar" }));

    // Antes de arreglar la caché el producto se quedaba visible y la app lanzaba
    // "Cannot read properties of undefined (reading 'totalPaginas')".
    await waitFor(() => expect(screen.queryByText("Gaseosa cola 2L")).not.toBeInTheDocument());
    expect(screen.getByText("Leche entera 1L")).toBeInTheDocument();
    // El contador de la paginación se actualiza con el total devuelto por el backend.
    expect(
      await screen.findByText((_, elemento) =>
        elemento?.tagName === "P" ? (elemento.textContent ?? "").includes("1 productos") : false,
      ),
    ).toBeInTheDocument();
    expect(eliminarProducto).toHaveBeenCalledWith("token", 1);
  });

  it("cierra el diálogo tras confirmar la baja", async () => {
    const queryClient = sembrarCatalogoEnMemoria([crearProducto(1, "Gaseosa cola 2L")]);
    const usuario = userEvent.setup();
    renderConProveedores(<ListadoProductos conAcciones />, { queryClient });

    await usuario.click(await screen.findByRole("button", { name: "Eliminar Gaseosa cola 2L" }));
    await usuario.click(await screen.findByRole("button", { name: "Sí, eliminar" }));

    await waitFor(() =>
      expect(screen.queryByRole("button", { name: "Sí, eliminar" })).not.toBeInTheDocument(),
    );
  });

  it("mantiene el producto cuando el usuario cancela", async () => {
    const queryClient = sembrarCatalogoEnMemoria([crearProducto(1, "Gaseosa cola 2L")]);
    const usuario = userEvent.setup();
    renderConProveedores(<ListadoProductos conAcciones />, { queryClient });

    await usuario.click(await screen.findByRole("button", { name: "Eliminar Gaseosa cola 2L" }));
    await usuario.click(await screen.findByRole("button", { name: "Cancelar" }));

    await waitFor(() =>
      expect(screen.queryByRole("button", { name: "Sí, eliminar" })).not.toBeInTheDocument(),
    );
    expect(eliminarProducto).not.toHaveBeenCalled();
    expect(screen.getByText("Gaseosa cola 2L")).toBeInTheDocument();
  });
});
