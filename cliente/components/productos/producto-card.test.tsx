import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ProductoCard } from "@/components/productos/producto-card";
import { renderConProveedores } from "@/tests/render-con-proveedor";
import type { Producto } from "@/lib/types/productos";

vi.mock("next/image", () => ({
  default: ({ alt, src }: { alt: string; src: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} src={typeof src === "string" ? src : ""} />
  ),
}));

const producto: Producto = {
  id: 1,
  nombre: "Gaseosa cola 2L",
  descripcion: "Bebida gaseosa",
  precioProveedor: 1500,
  precioVenta: 3200,
  margen: 1700,
  imagen: "/uploads/gaseosa.png",
  imagenUrl: "http://localhost:4000/uploads/gaseosa.png",
  activo: true,
  categoria: { id: 1, nombre: "Bebidas" },
};

describe("ProductoCard (CU-05)", () => {
  it("muestra la información principal del producto", () => {
renderConProveedores(<ProductoCard producto={producto} />);

    expect(screen.getByText("Gaseosa cola 2L")).toBeInTheDocument();
    expect(screen.getByText("Bebida gaseosa")).toBeInTheDocument();
    expect(screen.getByText("Bebidas")).toBeInTheDocument();
  });

  it("muestra los tres precios formateados", () => {
renderConProveedores(<ProductoCard producto={producto} />);

    expect(screen.getByText(/3\.200,00/)).toBeInTheDocument();
    expect(screen.getByText(/1\.500,00/)).toBeInTheDocument();
    expect(screen.getByText(/1\.700,00/)).toBeInTheDocument();
  });

  it("muestra la imagen cuando el producto la tiene", () => {
renderConProveedores(<ProductoCard producto={producto} />);

    expect(screen.getByAltText("Imagen de Gaseosa cola 2L")).toHaveAttribute(
      "src",
      "http://localhost:4000/uploads/gaseosa.png",
    );
  });

  it("indica cuando el producto no tiene imagen", () => {
renderConProveedores(<ProductoCard producto={{ ...producto, imagenUrl: null, imagen: null }} />);

    expect(screen.getByText("Sin imagen")).toBeInTheDocument();
  });

  it("omite editar y eliminar en el modo de solo consulta", () => {
renderConProveedores(<ProductoCard producto={producto} />);

    expect(screen.queryByRole("link", { name: /Editar/ })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Eliminar/ })).not.toBeInTheDocument();
  });

  it("enlaza a la edición y permite eliminar cuando muestra acciones", () => {
renderConProveedores(<ProductoCard producto={producto} mostrarAcciones />);

    expect(screen.getByRole("link", { name: /Editar/ })).toHaveAttribute(
      "href",
      "/productos/1/editar",
    );
    expect(screen.getByRole("button", { name: "Eliminar Gaseosa cola 2L" })).toBeInTheDocument();
  });
});
