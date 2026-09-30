import { afterEach, describe, expect, it, vi } from "vitest";
import * as categoriaService from "@/lib/services/categoria.service";
import * as productoService from "@/lib/services/producto.service";

const espiarFetch = (cuerpo: unknown = {}) => {
  const mock = vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    text: async () => JSON.stringify(cuerpo),
  });
  vi.stubGlobal("fetch", mock);
  return mock;
};

const ultimaPeticion = (mock: ReturnType<typeof espiarFetch>) => {
  const [url, opciones] = mock.mock.calls[0];
  return {
    url: String(url),
    metodo: opciones.method,
    cuerpo: opciones.body,
    encabezados: opciones.headers as Record<string, string>,
  };
};

describe("categoria.service", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("consulta el catálogo con GET /categorias", async () => {
    const mock = espiarFetch({ categorias: [{ id: 1, nombre: "Bebidas" }] });

    const resultado = await categoriaService.listarCategorias("token");

    expect(ultimaPeticion(mock).url).toContain("/categorias");
    expect(ultimaPeticion(mock).metodo).toBe("GET");
    expect(resultado.categorias).toHaveLength(1);
  });

  it("consulta el detalle por identificador", async () => {
    const mock = espiarFetch({ id: 2, nombre: "Mascotas" });

    const categoria = await categoriaService.obtenerCategoria("token", 2);

    expect(ultimaPeticion(mock).url).toContain("/categorias/2");
    expect(categoria.nombre).toBe("Mascotas");
  });
});

describe("producto.service", () => {
  afterEach(() => vi.unstubAllGlobals());

  const filtros = {
    nombre: "gaseosa",
    categoriaId: 2,
    orden: "precio_venta_desc",
    pagina: 3,
    limite: 12,
  } as const;

  it("arma el query string con los filtros del catálogo", async () => {
    const mock = espiarFetch({ productos: [], paginacion: {} });

    await productoService.listarProductos("token", filtros);

    const { url } = ultimaPeticion(mock);
    expect(url).toContain("nombre=gaseosa");
    expect(url).toContain("categoriaId=2");
    expect(url).toContain("orden=precio_venta_desc");
    expect(url).toContain("pagina=3");
    expect(url).toContain("limite=12");
  });

  it("omite la búsqueda vacía y la categoría sin seleccionar", async () => {
    const mock = espiarFetch({ productos: [], paginacion: {} });

    await productoService.listarProductos("token", {
      ...filtros,
      nombre: "   ",
      categoriaId: null,
    });

    const { url } = ultimaPeticion(mock);
    expect(url).not.toContain("nombre=");
    expect(url).not.toContain("categoriaId=");
  });

  it("envía el alta como FormData sin fijar el Content-Type", async () => {
    const mock = espiarFetch({ id: 1 });

    await productoService.crearProducto("token", {
      nombre: "Gaseosa",
      descripcion: "2L",
      categoriaId: 1,
      precioProveedor: 1500,
      precioVenta: 3200,
    });

    const peticion = ultimaPeticion(mock);
    expect(peticion.metodo).toBe("POST");
    expect(peticion.cuerpo).toBeInstanceOf(FormData);
    expect(peticion.encabezados["Content-Type"]).toBeUndefined();
    expect(peticion.encabezados.Authorization).toBe("Bearer token");

    const formulario = peticion.cuerpo as FormData;
    expect(formulario.get("nombre")).toBe("Gaseosa");
    expect(formulario.get("categoriaId")).toBe("1");
    expect(formulario.get("precioVenta")).toBe("3200");
    expect(formulario.get("imagen")).toBeNull();
  });

  it("adjunta la imagen cuando se seleccionado un archivo", async () => {
    const mock = espiarFetch({ id: 1 });
    const imagen = new File(["bytes"], "gaseosa.png", { type: "image/png" });

    await productoService.crearProducto("token", {
      nombre: "Gaseosa",
      descripcion: "",
      categoriaId: 1,
      precioProveedor: 1500,
      precioVenta: 3200,
      imagen,
    });

    expect((ultimaPeticion(mock).cuerpo as FormData).get("imagen")).toBe(imagen);
  });

  it("envía en la edición únicamente los campos presentes", async () => {
    const mock = espiarFetch({ id: 1 });

    await productoService.actualizarProducto("token", 1, { precioVenta: 4200 });

    const peticion = ultimaPeticion(mock);
    expect(peticion.metodo).toBe("PATCH");
    expect(peticion.url).toContain("/productos/1");

    const formulario = peticion.cuerpo as FormData;
    expect(formulario.get("precioVenta")).toBe("4200");
    expect(formulario.get("nombre")).toBeNull();
    expect(formulario.get("descripcion")).toBeNull();
    expect(formulario.get("categoriaId")).toBeNull();
  });

  it("elimina el producto con DELETE", async () => {
    const mock = espiarFetch({ mensaje: "El producto fue eliminado correctamente" });

    const respuesta = await productoService.eliminarProducto("token", 9);

    expect(ultimaPeticion(mock).metodo).toBe("DELETE");
    expect(ultimaPeticion(mock).url).toContain("/productos/9");
    expect(respuesta.mensaje).toContain("eliminado");
  });

  it("consulta el resumen del dashboard", async () => {
    const mock = espiarFetch({ totalProductos: 2, totalCategorias: 14, valorInventario: 100 });

    const resumen = await productoService.obtenerResumen("token");

    expect(ultimaPeticion(mock).url).toContain("/productos/resumen");
    expect(resumen.totalCategorias).toBe(14);
  });
});
