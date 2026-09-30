import { fireEvent, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ProductoForm } from "@/components/productos/producto-form";
import { crearProducto } from "@/lib/services/producto.service";
import { useAuthStore } from "@/lib/stores/auth.store";
import { renderConProveedores } from "@/tests/render-con-proveedor";
import type { Producto } from "@/lib/types/productos";

const { push, toastSuccess } = vi.hoisted(() => ({
  push: vi.fn(),
  toastSuccess: vi.fn(),
}));

vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));
vi.mock("sonner", () => ({ toast: { success: toastSuccess, error: vi.fn() } }));
vi.mock("next/image", () => ({
  default: ({ alt }: { alt: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} src="" />
  ),
}));
vi.mock("@/lib/services/categoria.service", () => ({
  listarCategorias: vi.fn().mockResolvedValue({
    categorias: [{ id: 1, nombre: "Bebidas", descripcion: null }],
  }),
}));
vi.mock("@/lib/services/producto.service", () => ({
  crearProducto: vi.fn(),
  actualizarProducto: vi.fn(),
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

/** Radix Select no responde a clic en jsdom: se abre con el teclado. */
const elegirCategoria = async (nombre: string) => {
  fireEvent.keyDown(await screen.findByLabelText("Categoría"), { key: "ArrowDown" });
  fireEvent.click(await screen.findByRole("option", { name: nombre }));
};

describe("ProductoForm (CU-07)", () => {
  beforeEach(() => {
    useAuthStore.setState({ token: "token" });
    vi.mocked(crearProducto).mockReset().mockResolvedValue(producto);
  });

  it("muestra los campos del producto y el selector de imagen", async () => {
    renderConProveedores(<ProductoForm />);

    expect(await screen.findByLabelText("Nombre")).toBeInTheDocument();
    expect(screen.getByLabelText("Descripción")).toBeInTheDocument();
    expect(screen.getByLabelText("Precio de proveedor")).toBeInTheDocument();
    expect(screen.getByLabelText("Precio de venta")).toBeInTheDocument();
    expect(screen.getByText("JPG, PNG o WebP · máximo 5 MB")).toBeInTheDocument();
  });

  it("exige nombre, precios y categoría antes de enviar", async () => {
    const usuario = userEvent.setup();
    renderConProveedores(<ProductoForm />);
    await screen.findByLabelText("Nombre");

    await usuario.click(screen.getByRole("button", { name: "Registrar producto" }));

    expect(await screen.findByText("El nombre debe tener al menos 2 caracteres")).toBeInTheDocument();
    expect(screen.getByText("La categoría es obligatoria")).toBeInTheDocument();
    expect(screen.getAllByText("Ingresa un número positivo con hasta 2 decimales")).toHaveLength(2);
    expect(crearProducto).not.toHaveBeenCalled();
  });

  it("rechaza un precio no numérico", async () => {
    const usuario = userEvent.setup();
    renderConProveedores(<ProductoForm />);
    await screen.findByLabelText("Nombre");

    await usuario.type(screen.getByLabelText("Precio de venta"), "abc");
    await usuario.click(screen.getByRole("button", { name: "Registrar producto" }));

    expect(
      (await screen.findAllByText("Ingresa un número positivo con hasta 2 decimales")).length,
    ).toBeGreaterThan(0);
    expect(crearProducto).not.toHaveBeenCalled();
  });

  it("registra el producto con los precios ya convertidos a número", async () => {
    const usuario = userEvent.setup();
    renderConProveedores(<ProductoForm />);
    await screen.findByLabelText("Nombre");

    await usuario.type(screen.getByLabelText("Nombre"), "Gaseosa cola 2L");
    await usuario.type(screen.getByLabelText("Precio de proveedor"), "1500,50");
    await usuario.type(screen.getByLabelText("Precio de venta"), "3200,25");
    await elegirCategoria("Bebidas");
    await usuario.click(screen.getByRole("button", { name: "Registrar producto" }));

    await waitFor(() =>
      expect(crearProducto).toHaveBeenCalledWith("token", {
        nombre: "Gaseosa cola 2L",
        descripcion: "",
        categoriaId: 1,
        precioProveedor: 1500.5,
        precioVenta: 3200.25,
        imagen: null,
      }),
    );
    expect(push).toHaveBeenCalledWith("/productos");
  });

  it("adjunta la imagen seleccionada al registro", async () => {
    const usuario = userEvent.setup();
    renderConProveedores(<ProductoForm />);
    await screen.findByLabelText("Nombre");

    const imagen = new File(["bytes"], "gaseosa.png", { type: "image/png" });
    await usuario.upload(screen.getByLabelText("Seleccionar imagen"), imagen);
    await usuario.type(screen.getByLabelText("Nombre"), "Gaseosa cola 2L");
    await usuario.type(screen.getByLabelText("Precio de proveedor"), "1500");
    await usuario.type(screen.getByLabelText("Precio de venta"), "3200");
    await elegirCategoria("Bebidas");
    await usuario.click(screen.getByRole("button", { name: "Registrar producto" }));

    await waitFor(() =>
      expect(crearProducto).toHaveBeenCalledWith(
        "token",
        expect.objectContaining({ imagen }),
      ),
    );
  });
});

describe("ProductoForm en modo edición (CU-08)", () => {
  beforeEach(() => {
    useAuthStore.setState({ token: "token" });
  });

  it("precarga los datos del producto existente", async () => {
    renderConProveedores(<ProductoForm producto={producto} />);

    await waitFor(() => expect(screen.getByLabelText("Nombre")).toHaveValue("Gaseosa cola 2L"));
    expect(screen.getByLabelText("Descripción")).toHaveValue("Bebida gaseosa");
    expect(screen.getByLabelText("Precio de proveedor")).toHaveValue("1500");
    expect(screen.getByLabelText("Precio de venta")).toHaveValue("3200");
    expect(screen.getByRole("button", { name: "Guardar cambios" })).toBeInTheDocument();
  });
});
