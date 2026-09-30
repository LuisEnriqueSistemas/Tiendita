import { describe, expect, it } from "vitest";
import { CATEGORIAS_PRECARGADAS } from "../constants/categorias-precargadas.js";
import { ApiError } from "../utils/ApiError.util.js";
import { CategoriaService } from "./categoria.service.js";
import { CategoriaRepositoryFake } from "../tests/categoria-repository.fake.js";

const construirServicio = (categorias = []) => {
  const categoriaRepository = new CategoriaRepositoryFake(categorias);
  return { categoriaService: new CategoriaService({ categoriaRepository }), categoriaRepository };
};

describe("CategoriaService", () => {
  describe("listar", () => {
    it("devuelve las categorías activas ordenadas por identificador", async () => {
      const { categoriaService } = construirServicio([
        { id: 5, nombre: "Otros" },
        { id: 1, nombre: "Bebidas" },
      ]);

      const categorias = await categoriaService.listar();

      expect(categorias.map((categoria) => categoria.nombre)).toEqual(["Bebidas", "Otros"]);
    });

    it("devuelve un listado vacío cuando no hay categorías", async () => {
      const { categoriaService } = construirServicio([]);

      await expect(categoriaService.listar()).resolves.toEqual([]);
    });

    it("oculta las columnas internas de la entidad", async () => {
      const { categoriaService } = construirServicio([
        { id: 1, nombre: "Bebidas", descripcion: "Líquidos" },
      ]);

      const [categoria] = await categoriaService.listar();

      expect(categoria).toEqual({ id: 1, nombre: "Bebidas", descripcion: "Líquidos" });
    });
  });

  describe("obtenerPorId", () => {
    it("devuelve la categoría solicitada", async () => {
      const { categoriaService } = construirServicio([{ id: 1, nombre: "Bebidas" }]);

      const categoria = await categoriaService.obtenerPorId(1);

      expect(categoria.nombre).toBe("Bebidas");
    });

    it("omite las columnas internas y normaliza la descripción", async () => {
      const { categoriaService } = construirServicio([{ id: 3, nombre: "Otros" }]);

      const categoria = await categoriaService.obtenerPorId(3);

      expect(categoria).toEqual({ id: 3, nombre: "Otros", descripcion: null });
    });

    it("lanza 404 cuando la categoría no existe", async () => {
      const { categoriaService } = construirServicio([{ id: 1, nombre: "Bebidas" }]);

      await expect(categoriaService.obtenerPorId(99)).rejects.toMatchObject({
        status: 404,
        codigo: "CATEGORIA_NO_ENCONTRADA",
      });
    });
  });

  describe("exigirActiva", () => {
    it("devuelve la categoría cuando está activa", async () => {
      const { categoriaService } = construirServicio([{ id: 2, nombre: "Mascotas" }]);

      const categoria = await categoriaService.exigirActiva(2);

      expect(categoria.nombre).toBe("Mascotas");
    });

    it("lanza 400 CATEGORIA_NO_DISPONIBLE cuando la categoría no existe", async () => {
      const { categoriaService } = construirServicio([]);

      await expect(categoriaService.exigirActiva(7)).rejects.toMatchObject({
        status: 400,
        codigo: "CATEGORIA_NO_DISPONIBLE",
      });
    });

    it("lanza 400 cuando la categoría está inactiva", async () => {
      const { categoriaService } = construirServicio([{ id: 3, nombre: "Otros", activo: false }]);

      await expect(categoriaService.exigirActiva(3)).rejects.toBeInstanceOf(ApiError);
    });
  });

  describe("precargar", () => {
    it("inserta el catálogo precargado", async () => {
      const { categoriaService } = construirServicio([]);

      const categorias = await categoriaService.precargar();

      expect(categorias).toHaveLength(CATEGORIAS_PRECARGADAS.length);
      expect(categorias[0].nombre).toBe(CATEGORIAS_PRECARGADAS[0].nombre);
      expect(categorias[0].esFija).toBe(true);
    });

    it("es idempotente: no duplica al ejecutarse dos veces", async () => {
      const { categoriaService } = construirServicio([]);

      await categoriaService.precargar();
      const categorias = await categoriaService.precargar();

      expect(categorias).toHaveLength(CATEGORIAS_PRECARGADAS.length);
    });

    it("acepta un catálogo personalizado", async () => {
      const { categoriaService } = construirServicio([]);

      const categorias = await categoriaService.precargar([{ nombre: "Prueba" }]);

      expect(categorias).toEqual([
        expect.objectContaining({ id: 1, nombre: "Prueba", descripcion: null, esFija: true }),
      ]);
    });
  });
});
