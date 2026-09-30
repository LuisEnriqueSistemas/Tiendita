import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { FiltrosProductos } from "@/components/productos/filtros-productos";
import { listarProductos } from "@/lib/services/producto.service";
import { renderConProveedores } from "@/tests/render-con-proveedor";
import { FILTROS_INICIALES, useFiltrosStore } from "@/lib/stores/filtros.store";
import { useAuthStore } from "@/lib/stores/auth.store";

vi.mock("@/lib/services/categoria.service", () => ({
  listarCategorias: vi.fn().mockResolvedValue({
    categorias: [
      { id: 1, nombre: "Bebidas", descripcion: null },
      { id: 2, nombre: "Mascotas", descripcion: null },
    ],
  }),
}));

describe("FiltrosProductos (CU-05)", () => {
  beforeEach(() => {
    useFiltrosStore.setState({ ...FILTROS_INICIALES });
    useAuthStore.setState({ token: "token" });
  });

  it("escribe la búsqueda en el store de filtros", async () => {
    const usuario = userEvent.setup();
    renderConProveedores(<FiltrosProductos />);

    await usuario.type(screen.getByLabelText("Buscar producto por nombre"), "gaseosa");

    expect(useFiltrosStore.getState().nombre).toBe("gaseosa");
  });

  it("vuelve a la primera página al buscar", async () => {
    const usuario = userEvent.setup();
    useFiltrosStore.setState({ pagina: 3 });
    renderConProveedores(<FiltrosProductos />);

    await usuario.type(screen.getByLabelText("Buscar producto por nombre"), "a");

    expect(useFiltrosStore.getState().pagina).toBe(1);
  });

  it("carga las categorías del catálogo en el selector", async () => {
    renderConProveedores(<FiltrosProductos />);

    await waitFor(() => expect(screen.getByLabelText("Filtrar por categoría")).toBeInTheDocument());
    expect(screen.getByText("Todas las categorías")).toBeInTheDocument();
  });

  it("muestra el botón de limpiar solo cuando hay filtros aplicados", async () => {
    const usuario = userEvent.setup();
    renderConProveedores(<FiltrosProductos />);

    expect(screen.queryByRole("button", { name: /Limpiar/ })).not.toBeInTheDocument();

    await usuario.type(screen.getByLabelText("Buscar producto por nombre"), "gaseosa");

    expect(screen.getByRole("button", { name: /Limpiar/ })).toBeInTheDocument();
  });

  it("restablece los filtros al limpiar", async () => {
    const usuario = userEvent.setup();
    useFiltrosStore.setState({ nombre: "gaseosa", categoriaId: 2, pagina: 4 });
    renderConProveedores(<FiltrosProductos />);

    await usuario.click(screen.getByRole("button", { name: /Limpiar/ }));

    expect(useFiltrosStore.getState()).toMatchObject({
      nombre: "",
      categoriaId: null,
      pagina: 1,
    });
  });
});

vi.mock("@/lib/services/producto.service", () => ({
  listarProductos: vi.fn().mockResolvedValue({
    productos: [],
    paginacion: { total: 0, pagina: 1, limite: 12, totalPaginas: 1 },
  }),
}));

describe("ListadoProductos con filtros (CU-05)", () => {
  beforeEach(() => {
    useFiltrosStore.setState({ ...FILTROS_INICIALES });
    useAuthStore.setState({ token: "token" });
    vi.mocked(listarProductos).mockClear();
  });

  it("consulta el catálogo aplicando el filtro de búsqueda", async () => {
    const usuario = userEvent.setup();
    const { ListadoProductos } = await import("@/components/productos/listado-productos");
    renderConProveedores(<ListadoProductos />);

    await usuario.type(await screen.findByLabelText("Buscar producto por nombre"), "gaseosa");

    await waitFor(() =>
      expect(listarProductos).toHaveBeenCalledWith(
        "token",
        expect.objectContaining({ nombre: "gaseosa" }),
        expect.anything(),
      ),
    );
  });

  it("muestra el estado vacío cuando no hay coincidencias", async () => {
    const { ListadoProductos } = await import("@/components/productos/listado-productos");
    renderConProveedores(<ListadoProductos />);

    expect(await screen.findByText("No hay productos que coincidan")).toBeInTheDocument();
  });
});
