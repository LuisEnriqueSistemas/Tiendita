import { describe, expect, it, vi } from "vitest";
import { ProductoController } from "./producto.controller.js";
import { crearResFalso } from "../tests/http.fake.js";

const crearServiciosFalsos = () => ({
  productoService: {
    listar: vi.fn(),
    obtenerPorId: vi.fn(),
    crear: vi.fn(),
    actualizar: vi.fn(),
    eliminar: vi.fn(),
    valorInventario: vi.fn(),
  },
  categoriaService: { listar: vi.fn() },
});

describe("ProductoController", () => {
  it("listar responde 200 con productos y paginación", async () => {
    const dependencias = crearServiciosFalsos();
    const paginacion = { total: 1, pagina: 1, limite: 12, totalPaginas: 1 };
    dependencias.productoService.listar.mockResolvedValue({
      productos: [{ id: 1, nombre: "Gaseosa" }],
      paginacion,
    });
    const res = crearResFalso();

    await new ProductoController(dependencias).listar({ query: { categoriaId: 2 } }, res);

    expect(dependencias.productoService.listar).toHaveBeenCalledWith({ categoriaId: 2 });
    expect(res.statusCode).toBe(200);
    expect(res.cuerpo.paginacion).toEqual(paginacion);
  });

  it("obtenerPorId convierte el parámetro a número", async () => {
    const dependencias = crearServiciosFalsos();
    dependencias.productoService.obtenerPorId.mockResolvedValue({ id: 5 });
    const res = crearResFalso();

    await new ProductoController(dependencias).obtenerPorId({ params: { id: "5" } }, res);

    expect(dependencias.productoService.obtenerPorId).toHaveBeenCalledWith(5);
    expect(res.statusCode).toBe(200);
  });

  it("crear responde 201 y adjunta el archivo MULTIPART", async () => {
    const dependencias = crearServiciosFalsos();
    dependencias.productoService.crear.mockResolvedValue({ id: 1 });
    const req = { body: { nombre: "Gaseosa" }, file: { originalname: "gaseosa.png" } };
    const res = crearResFalso();

    await new ProductoController(dependencias).crear(req, res);

    expect(dependencias.productoService.crear).toHaveBeenCalledWith({
      nombre: "Gaseosa",
      imagen: { originalname: "gaseosa.png" },
    });
    expect(res.statusCode).toBe(201);
  });

  it("crear envía imagen nula cuando la petición no trae archivo", async () => {
    const dependencias = crearServiciosFalsos();
    dependencias.productoService.crear.mockResolvedValue({ id: 1 });
    const res = crearResFalso();

    await new ProductoController(dependencias).crear({ body: { nombre: "Gaseosa" } }, res);

    expect(dependencias.productoService.crear).toHaveBeenCalledWith({
      nombre: "Gaseosa",
      imagen: null,
    });
  });

  it("actualizar responde 200 con el identificador de la ruta", async () => {
    const dependencias = crearServiciosFalsos();
    dependencias.productoService.actualizar.mockResolvedValue({ id: 7, nombre: "Gaseosa 2L" });
    const res = crearResFalso();

    await new ProductoController(dependencias).actualizar(
      { params: { id: "7" }, body: { nombre: "Gaseosa 2L" } },
      res,
    );

    expect(dependencias.productoService.actualizar).toHaveBeenCalledWith(7, {
      nombre: "Gaseosa 2L",
      imagen: null,
    });
    expect(res.statusCode).toBe(200);
  });

  it("eliminar responde 200 con el mensaje de confirmación", async () => {
    const dependencias = crearServiciosFalsos();
    dependencias.productoService.eliminar.mockResolvedValue({ mensaje: "Producto eliminado" });
    const res = crearResFalso();

    await new ProductoController(dependencias).eliminar({ params: { id: "3" } }, res);

    expect(dependencias.productoService.eliminar).toHaveBeenCalledWith(3);
    expect(res.cuerpo).toEqual({ mensaje: "Producto eliminado" });
  });

  it("resumen agrega el total de productos, categorías y el valor del inventario", async () => {
    const dependencias = crearServiciosFalsos();
    dependencias.productoService.listar.mockResolvedValue({
      productos: [],
      paginacion: { total: 7, pagina: 1, limite: 1, totalPaginas: 7 },
    });
    dependencias.productoService.valorInventario.mockResolvedValue(1234.5);
    dependencias.categoriaService.listar.mockResolvedValue([{ id: 1 }, { id: 2 }]);
    const res = crearResFalso();

    await new ProductoController(dependencias).resumen({}, res);

    expect(res.statusCode).toBe(200);
    expect(res.cuerpo).toEqual({ totalProductos: 7, totalCategorias: 2, valorInventario: 1234.5 });
  });
});
