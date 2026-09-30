import { describe, expect, it, vi } from "vitest";
import { CategoriaController } from "./categoria.controller.js";
import { crearResFalso } from "../tests/http.fake.js";

const crearCategoriaServiceFalso = () => ({
  listar: vi.fn(),
  obtenerPorId: vi.fn(),
});

describe("CategoriaController", () => {
  it("listar responde 200 con el array de categorías", async () => {
    const categorias = [
      { id: 1, nombre: "Bebidas", descripcion: "Líquidos" },
      { id: 2, nombre: "Mascotas", descripcion: null },
    ];
    const categoriaService = crearCategoriaServiceFalso();
    categoriaService.listar.mockResolvedValue(categorias);
    const res = crearResFalso();

    await new CategoriaController({ categoriaService }).listar({}, res);

    expect(categoriaService.listar).toHaveBeenCalledTimes(1);
    expect(res.statusCode).toBe(200);
    expect(res.cuerpo).toEqual({ categorias });
  });

  it("listar devuelve un arreglo vacío cuando el catálogo no tiene registros", async () => {
    const categoriaService = crearCategoriaServiceFalso();
    categoriaService.listar.mockResolvedValue([]);
    const res = crearResFalso();

    await new CategoriaController({ categoriaService }).listar({}, res);

    expect(res.cuerpo).toEqual({ categorias: [] });
  });

  it("obtenerPorId convierte el parámetro a número", async () => {
    const categoriaService = crearCategoriaServiceFalso();
    categoriaService.obtenerPorId.mockResolvedValue({ id: 3, nombre: "Otros" });
    const res = crearResFalso();

    await new CategoriaController({ categoriaService }).obtenerPorId({ params: { id: "3" } }, res);

    expect(categoriaService.obtenerPorId).toHaveBeenCalledWith(3);
    expect(res.statusCode).toBe(200);
    expect(res.cuerpo).toEqual({ id: 3, nombre: "Otros" });
  });
});
