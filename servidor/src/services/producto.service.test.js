import { describe, expect, it } from "vitest";
import { CategoriaService } from "./categoria.service.js";
import { ProductoService } from "./producto.service.js";
import { CategoriaRepositoryFake } from "../tests/categoria-repository.fake.js";
import { ProductoRepositoryFake } from "../tests/producto-repository.fake.js";
import { StorageServiceFake } from "../tests/storage-service.fake.js";

const CATEGORIAS = [
  { id: 1, nombre: "Bebidas" },
  { id: 2, nombre: "Mascotas" },
  { id: 3, nombre: "Otros", activo: false },
];

const config = {
  server: { publicBaseUrl: "http://localhost:4000/" },
  uploads: { publicPath: "/uploads" },
};

const construir = (productos = []) => {
  const productoRepository = new ProductoRepositoryFake(productos, CATEGORIAS);
  const categoriaService = new CategoriaService({
    categoriaRepository: new CategoriaRepositoryFake(CATEGORIAS),
  });
  const storageService = new StorageServiceFake();
  const productoService = new ProductoService({
    productoRepository,
    categoriaService,
    storageService,
    config,
  });
  return { productoService, productoRepository, storageService, categoriaService };
};

const datosValidos = {
  nombre: "Gaseosa cola 2L",
  descripcion: "Bebida gaseosa",
  precioProveedor: 1.5,
  precioVenta: 3.25,
  categoriaId: 1,
};

const archivoImagen = (originalname = "Gaseosa Cola.png") => ({
  originalname,
  mimetype: "image/png",
  size: 1024,
});

describe("ProductoService", () => {
  describe("crear", () => {
    it("registra el producto y devuelve la categoría asociada", async () => {
      const { productoService } = construir();

      const producto = await productoService.crear(datosValidos);

      expect(producto).toMatchObject({
        id: 1,
        nombre: "Gaseosa cola 2L",
        descripcion: "Bebida gaseosa",
        precioProveedor: 1.5,
        precioVenta: 3.25,
        margen: 1.75,
        categoria: { id: 1, nombre: "Bebidas" },
        imagenUrl: null,
        activo: true,
      });
    });

    it("convierte los decimales de PostgreSQL (texto) a número", async () => {
      const { productoService } = construir();

      const producto = await productoService.crear(datosValidos);

      expect(typeof producto.precioVenta).toBe("number");
      expect(typeof producto.precioProveedor).toBe("number");
    });

    it("guarda la imagen y expone su URL absoluta", async () => {
      const { productoService, storageService } = construir();

      const producto = await productoService.crear({ ...datosValidos, imagen: archivoImagen() });

      expect(storageService.archivados).toHaveLength(1);
      expect(producto.imagenUrl).toBe("http://localhost:4000/uploads/1-Gaseosa Cola.png");
    });

    it("rechaza una categoría que no está disponible", async () => {
      const { productoService } = construir();

      await expect(
        productoService.crear({ ...datosValidos, categoriaId: 99 }),
      ).rejects.toMatchObject({ status: 400, codigo: "CATEGORIA_NO_DISPONIBLE" });
    });

    it("rechaza una categoría inactiva", async () => {
      const { productoService } = construir();

      await expect(productoService.crear({ ...datosValidos, categoriaId: 3 })).rejects.toMatchObject({
        codigo: "CATEGORIA_NO_DISPONIBLE",
      });
    });

    it("no guarda la imagen si la categoría es inválida", async () => {
      const { productoService, storageService } = construir();

      await productoService.crear({ ...datosValidos, categoriaId: 99, imagen: archivoImagen() }).catch(() => {});

      expect(storageService.archivados).toHaveLength(0);
    });
  });

  describe("listar", () => {
    const productos = [
      { nombre: "Gaseosa cola", precioProveedor: 1, precioVenta: 3, categoriaId: 1 },
      { nombre: "Agua mineral", precioProveedor: 0.5, precioVenta: 1.5, categoriaId: 1 },
      { nombre: "Alimento perros", precioProveedor: 18, precioVenta: 34.9, categoriaId: 2 },
    ];

    it("devuelve todos los productos activos con su paginación", async () => {
      const { productoService } = construir(productos);

      const resultado = await productoService.listar();

      expect(resultado.productos).toHaveLength(3);
      expect(resultado.paginacion).toEqual({ total: 3, pagina: 1, limite: 12, totalPaginas: 1 });
    });

    it("filtra por nombre sin distinguir mayúsculas", async () => {
      const { productoService } = construir(productos);

      const resultado = await productoService.listar({ nombre: "GASEO" });

      expect(resultado.productos.map((p) => p.nombre)).toEqual(["Gaseosa cola"]);
    });

    it("filtra por categoría", async () => {
      const { productoService } = construir(productos);

      const resultado = await productoService.listar({ categoriaId: 2 });

      expect(resultado.productos.map((p) => p.nombre)).toEqual(["Alimento perros"]);
    });

    it("combina búsqueda por nombre y categoría", async () => {
      const { productoService } = construir(productos);

      const resultado = await productoService.listar({ nombre: "agua", categoriaId: 2 });

      expect(resultado.productos).toHaveLength(0);
    });

    it("ordena por precio de venta descendente", async () => {
      const { productoService } = construir(productos);

      const resultado = await productoService.listar({ orden: "precio_venta_desc" });

      expect(resultado.productos.map((p) => p.nombre)).toEqual([
        "Alimento perros",
        "Gaseosa cola",
        "Agua mineral",
      ]);
    });

    it("pagina los resultados", async () => {
      const { productoService } = construir(productos);

      const resultado = await productoService.listar({ pagina: 2, limite: 2 });

      expect(resultado.productos).toHaveLength(1);
      expect(resultado.paginacion).toEqual({ total: 3, pagina: 2, limite: 2, totalPaginas: 2 });
    });

    it("excluye los productos dados de baja", async () => {
      const { productoService, productoRepository } = construir(productos);
      await productoRepository.softDelete(1);

      const resultado = await productoService.listar();

      expect(resultado.paginacion.total).toBe(2);
    });

    it("reporta al menos una página aunque no haya productos", async () => {
      const { productoService } = construir([]);

      const resultado = await productoService.listar();

      expect(resultado.paginacion).toEqual({ total: 0, pagina: 1, limite: 12, totalPaginas: 1 });
    });
  });

  describe("obtenerPorId", () => {
    it("devuelve el producto con su categoría", async () => {
      const { productoService } = construir([{ nombre: "Gaseosa", precioVenta: 3, categoriaId: 1 }]);

      const producto = await productoService.obtenerPorId(1);

      expect(producto.categoria.nombre).toBe("Bebidas");
    });

    it("lanza 404 cuando el producto no existe", async () => {
      const { productoService } = construir([]);

      await expect(productoService.obtenerPorId(42)).rejects.toMatchObject({
        status: 404,
        codigo: "PRODUCTO_NO_ENCONTRADO",
      });
    });
  });

  describe("actualizar", () => {
    it("aplica solo los campos enviados", async () => {
      const { productoService } = construir([
        { nombre: "Gaseosa", descripcion: "Antes", precioProveedor: 1, precioVenta: 3, categoriaId: 1 },
      ]);

      const producto = await productoService.actualizar(1, { precioVenta: 4.5 });

      expect(producto.precioVenta).toBe(4.5);
      expect(producto.nombre).toBe("Gaseosa");
      expect(producto.descripcion).toBe("Antes");
    });

    it("cambia la categoría validando que esté disponible", async () => {
      const { productoService } = construir([
        { nombre: "Gaseosa", precioVenta: 3, categoriaId: 1 },
      ]);

      const producto = await productoService.actualizar(1, { categoriaId: 2 });

      expect(producto.categoria.nombre).toBe("Mascotas");
    });

    it("rechaza cambiar a una categoría no disponible", async () => {
      const { productoService } = construir([
        { nombre: "Gaseosa", precioVenta: 3, categoriaId: 1 },
      ]);

      await expect(productoService.actualizar(1, { categoriaId: 99 })).rejects.toMatchObject({
        codigo: "CATEGORIA_NO_DISPONIBLE",
      });
    });

    it("reemplaza la imagen y elimina la anterior del almacenamiento", async () => {
      const { productoService, storageService } = construir([
        { nombre: "Gaseosa", precioVenta: 3, categoriaId: 1, imagen: "/uploads/vieja.png" },
      ]);

      const producto = await productoService.actualizar(1, { imagen: archivoImagen("Nueva.png") });

      expect(producto.imagenUrl).toBe("http://localhost:4000/uploads/1-Nueva.png");
      expect(storageService.eliminados).toEqual(["/uploads/vieja.png"]);
    });

    it("no borra ninguna imagen cuando no se envía una nueva", async () => {
      const { productoService, storageService } = construir([
        { nombre: "Gaseosa", precioVenta: 3, categoriaId: 1, imagen: "/uploads/vieja.png" },
      ]);

      await productoService.actualizar(1, { nombre: "Gaseosa 2L" });

      expect(storageService.eliminados).toEqual([]);
    });

    it("acepta una actualización compuesta solo por la imagen", async () => {
      const { productoService } = construir([{ nombre: "Gaseosa", precioVenta: 3, categoriaId: 1 }]);

      const producto = await productoService.actualizar(1, { imagen: archivoImagen() });

      expect(producto.imagenUrl).not.toBeNull();
    });

    it("rechaza una actualización sin ningún campo", async () => {
      const { productoService } = construir([{ nombre: "Gaseosa", precioVenta: 3, categoriaId: 1 }]);

      await expect(productoService.actualizar(1, {})).rejects.toMatchObject({ status: 400 });
    });

    it("lanza 404 cuando el producto no existe", async () => {
      const { productoService } = construir([]);

      await expect(productoService.actualizar(9, { nombre: "Nuevo" })).rejects.toMatchObject({
        codigo: "PRODUCTO_NO_ENCONTRADO",
      });
    });
  });

  describe("eliminar", () => {
    it("realiza la baja lógica y devuelve el mensaje de confirmación", async () => {
      const { productoService, productoRepository } = construir([
        { nombre: "Gaseosa", precioVenta: 3, categoriaId: 1 },
      ]);

      const resultado = await productoService.eliminar(1);

      expect(resultado.mensaje).toBe("El producto fue eliminado correctamente");
      expect((await productoRepository.findById(1))).toBeNull();
    });

    it("lanza 404 si el producto ya fue eliminado", async () => {
      const { productoService, productoRepository } = construir([
        { nombre: "Gaseosa", precioVenta: 3, categoriaId: 1 },
      ]);
      await productoRepository.softDelete(1);

      await expect(productoService.eliminar(1)).rejects.toMatchObject({
        codigo: "PRODUCTO_NO_ENCONTRADO",
      });
    });
  });

  describe("valorInventario", () => {
    it("suma los precios de venta de los productos activos", async () => {
      const { productoService } = construir([
        { nombre: "A", precioVenta: 10, categoriaId: 1 },
        { nombre: "B", precioVenta: 5.5, categoriaId: 1 },
      ]);

      await expect(productoService.valorInventario()).resolves.toBe(15.5);
    });

    it("devuelve 0 cuando no hay productos", async () => {
      const { productoService } = construir([]);

      await expect(productoService.valorInventario()).resolves.toBe(0);
    });
  });

  describe("aRespuesta", () => {
    it("expone la categoría nula si la entidad no la trae", async () => {
      const { productoService } = construir();

      const respuesta = productoService.aRespuesta({
        id: 7,
        nombre: "Producto",
        descripcion: null,
        imagen: null,
        precioProveedor: "10.00",
        precioVenta: "20.00",
        categoriaId: 1,
        categoria: null,
        activo: true,
      });

      expect(respuesta).toMatchObject({
        descripcion: null,
        imagenUrl: null,
        precioProveedor: 10,
        precioVenta: 20,
        margen: 10,
        categoria: null,
      });
    });

    it("trata los precios nulos como cero", () => {
      const { productoService } = construir();

      const respuesta = productoService.aRespuesta({
        id: 8,
        nombre: "Producto",
        descripcion: null,
        imagen: null,
        precioProveedor: null,
        precioVenta: null,
        categoriaId: 1,
        categoria: { id: 1, nombre: "Bebidas" },
        activo: true,
      });

      expect(respuesta.precioProveedor).toBe(0);
      expect(respuesta.margen).toBe(0);
    });
  });
});
