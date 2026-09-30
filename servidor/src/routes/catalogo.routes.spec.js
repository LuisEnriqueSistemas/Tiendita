import { Buffer } from "node:buffer";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { crearApp } from "../../app.js";
import { crearContenedorDePruebas, registrarUsuario, tokenDe } from "../tests/contenedor-pruebas.js";

/** PNG 1x1 válido: permite ejercitar el filtro de tipo de imagen. */
const PNG_MINIMO = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);

const escribirArchivo = (contenido, extension = ".png") => {
  const ruta = path.join(mkdtempSync(path.join(tmpdir(), "tienda-pruebas-")), `imagen${extension}`);
  writeFileSync(ruta, contenido);
  return ruta;
};

const CREDENCIALES = { email: "ana@tienda.com", password: "ClaveSegura1" };

const PRODUCTOS = [
  { nombre: "Gaseosa cola", precioProveedor: 1, precioVenta: 3, categoriaId: 1 },
  { nombre: "Agua mineral", precioProveedor: 0.5, precioVenta: 1.5, categoriaId: 1 },
  { nombre: "Alimento perros", precioProveedor: 18, precioVenta: 34.9, categoriaId: 2 },
];

const CAMPOS = {
  nombre: "Gaseosa cola 2L",
  descripcion: "Bebida gaseosa",
  precioProveedor: "1,50",
  precioVenta: "3.25",
  categoriaId: "1",
};

describe("API del catálogo (Categorías y Productos)", () => {
  let app;
  let contenedor;
  let token;

  /**
   * Levanta la aplicación con un escenario de datos y una sesión iniciada.
   * @param {object[]} [productos] Productos iniciales del inventario.
   */
  const montarEscenario = async (productos = []) => {
    contenedor = crearContenedorDePruebas({ productos });
    app = crearApp({ contenedor });
    const usuario = await registrarUsuario(contenedor, CREDENCIALES);
    token = await tokenDe(contenedor, { userId: usuario.id, email: usuario.email });
  };

  const autorizado = (peticion) => peticion.set("Authorization", `Bearer ${token}`);

  beforeEach(async () => montarEscenario());

  describe("GET /api/categorias", () => {
    it("devuelve el catálogo con el sobre del contrato", async () => {
      const respuesta = await autorizado(request(app).get("/api/categorias"));

      expect(respuesta.status).toBe(200);
      expect(respuesta.body.categorias).toHaveLength(3);
      expect(respuesta.body.categorias[0]).toMatchObject({ id: 1, nombre: "Bebidas" });
    });

    it("responde 401 sin token", async () => {
      const respuesta = await request(app).get("/api/categorias");

      expect(respuesta.status).toBe(401);
      expect(respuesta.body.error.codigo).toBe("NO_AUTENTICADO");
    });

    it("devuelve el detalle de una categoría", async () => {
      const respuesta = await autorizado(request(app).get("/api/categorias/2"));

      expect(respuesta.status).toBe(200);
      expect(respuesta.body.nombre).toBe("Mascotas");
    });

    it("responde 404 para una categoría inexistente", async () => {
      const respuesta = await autorizado(request(app).get("/api/categorias/77"));

      expect(respuesta.status).toBe(404);
      expect(respuesta.body.error.codigo).toBe("CATEGORIA_NO_ENCONTRADA");
    });

    it("responde 400 para un identificador no numérico", async () => {
      const respuesta = await autorizado(request(app).get("/api/categorias/abc"));

      expect(respuesta.status).toBe(400);
      expect(respuesta.body.error.codigo).toBe("VALIDACION_FALLIDA");
    });
  });

  describe("POST /api/productos", () => {
    it("registra el producto y responde 201 con la categoría y el margen", async () => {
      const respuesta = await autorizado(request(app).post("/api/productos")).field(CAMPOS);

      expect(respuesta.status).toBe(201);
      expect(respuesta.body).toMatchObject({
        nombre: "Gaseosa cola 2L",
        precioProveedor: 1.5,
        precioVenta: 3.25,
        margen: 1.75,
        imagenUrl: null,
        categoria: { id: 1, nombre: "Bebidas" },
      });
    });

    it("acepta la imagen y devuelve su URL pública", async () => {
      const respuesta = await autorizado(request(app).post("/api/productos"))
        .field(CAMPOS)
        .attach("imagen", escribirArchivo(PNG_MINIMO));

      expect(respuesta.status).toBe(201);
      expect(respuesta.body.imagenUrl).toMatch(/^http:\/\/localhost:4000\/uploads\//);
      expect(contenedor.storageService.archivados).toHaveLength(1);
    });

    it("rechaza una imagen de tipo no permitido", async () => {
      const respuesta = await autorizado(request(app).post("/api/productos"))
        .field(CAMPOS)
        .attach("imagen", escribirArchivo("texto plano", ".txt"));

      expect(respuesta.status).toBe(400);
      expect(respuesta.body.error.codigo).toBe("IMAGEN_INVALIDA");
    });

    it("rechaza una imagen que supera el tamaño máximo", async () => {
      const grande = Buffer.concat([PNG_MINIMO, Buffer.alloc(6 * 1024 * 1024)]);
      const respuesta = await autorizado(request(app).post("/api/productos"))
        .field(CAMPOS)
        .attach("imagen", escribirArchivo(grande));

      expect(respuesta.status).toBe(400);
      expect(respuesta.body.error.codigo).toBe("IMAGEN_INVALIDA");
      expect(respuesta.body.error.mensaje).toContain("tamaño máximo");
    });

    it("responde 400 detallando los campos faltantes", async () => {
      const respuesta = await autorizado(request(app).post("/api/productos")).field({ nombre: "X" });

      expect(respuesta.status).toBe(400);
      expect(respuesta.body.error.detalles.map((d) => d.campo).sort()).toEqual([
        "categoriaId",
        "nombre",
        "precioProveedor",
        "precioVenta",
      ]);
    });

    it("rechaza precios negativos o cero", async () => {
      const respuesta = await autorizado(request(app).post("/api/productos")).field({
        ...CAMPOS,
        precioVenta: "-5",
      });

      expect(respuesta.status).toBe(400);
      expect(respuesta.body.error.detalles[0].campo).toBe("precioVenta");
    });

    it("rechaza una categoría que no existe", async () => {
      const respuesta = await autorizado(request(app).post("/api/productos")).field({
        ...CAMPOS,
        categoriaId: "999",
      });

      expect(respuesta.status).toBe(400);
      expect(respuesta.body.error.codigo).toBe("CATEGORIA_NO_DISPONIBLE");
    });

    it("responde 401 sin token", async () => {
      const respuesta = await request(app).post("/api/productos").field(CAMPOS);

      expect(respuesta.status).toBe(401);
    });
  });

  describe("GET /api/productos", () => {
    beforeEach(() => montarEscenario(PRODUCTOS));

    it("devuelve todos los productos activos", async () => {
      const respuesta = await autorizado(request(app).get("/api/productos"));

      expect(respuesta.status).toBe(200);
      expect(respuesta.body.productos).toHaveLength(3);
      expect(respuesta.body.paginacion).toEqual({ total: 3, pagina: 1, limite: 12, totalPaginas: 1 });
    });

    it("expone la categoría y el margen de cada producto", async () => {
      const respuesta = await autorizado(request(app).get("/api/productos"));

      expect(respuesta.body.productos[0]).toMatchObject({
        nombre: "Gaseosa cola",
        margen: 2,
        categoria: { id: 1, nombre: "Bebidas" },
      });
    });

    it("filtra por nombre sin distinguir mayúsculas", async () => {
      const respuesta = await autorizado(request(app).get("/api/productos").query({ nombre: "GASEO" }));

      expect(respuesta.body.productos.map((p) => p.nombre)).toEqual(["Gaseosa cola"]);
    });

    it("filtra por categoría", async () => {
      const respuesta = await autorizado(request(app).get("/api/productos").query({ categoriaId: 2 }));

      expect(respuesta.body.productos.map((p) => p.nombre)).toEqual(["Alimento perros"]);
    });

    it("combina la búsqueda por nombre con el filtro de categoría", async () => {
      const coincidencia = await autorizado(
        request(app).get("/api/productos").query({ nombre: "agua", categoriaId: 1 }),
      );
      const sinCoincidencia = await autorizado(
        request(app).get("/api/productos").query({ nombre: "agua", categoriaId: 2 }),
      );

      expect(coincidencia.body.productos).toHaveLength(1);
      expect(sinCoincidencia.body.productos).toHaveLength(0);
    });

    it("ordena por precio de venta descendente", async () => {
      const respuesta = await autorizado(
        request(app).get("/api/productos").query({ orden: "precio_venta_desc" }),
      );

      expect(respuesta.body.productos[0].nombre).toBe("Alimento perros");
    });

    it("pagina los resultados", async () => {
      const respuesta = await autorizado(request(app).get("/api/productos").query({ limite: 2, pagina: 2 }));

      expect(respuesta.body.productos).toHaveLength(1);
      expect(respuesta.body.paginacion).toEqual({ total: 3, pagina: 2, limite: 2, totalPaginas: 2 });
    });

    it("rechaza un orden fuera de la lista blanca", async () => {
      const respuesta = await autorizado(request(app).get("/api/productos").query({ orden: "DROP TABLE" }));

      expect(respuesta.status).toBe(400);
      expect(respuesta.body.error.detalles[0].campo).toBe("orden");
    });

    it("rechaza una búsqueda de un solo carácter", async () => {
      const respuesta = await autorizado(request(app).get("/api/productos").query({ nombre: "a" }));

      expect(respuesta.status).toBe(400);
    });

    it("responde 401 sin token", async () => {
      const respuesta = await request(app).get("/api/productos");

      expect(respuesta.status).toBe(401);
    });
  });

  describe("GET /api/productos/:id", () => {
    it("devuelve el detalle del producto", async () => {
      await montarEscenario([{ nombre: "Gaseosa", precioVenta: 3, categoriaId: 1 }]);

      const respuesta = await autorizado(request(app).get("/api/productos/1"));

      expect(respuesta.status).toBe(200);
      expect(respuesta.body.categoria.nombre).toBe("Bebidas");
    });

    it("responde 404 si el producto no existe", async () => {
      const respuesta = await autorizado(request(app).get("/api/productos/55"));

      expect(respuesta.status).toBe(404);
      expect(respuesta.body.error.codigo).toBe("PRODUCTO_NO_ENCONTRADO");
    });
  });

  describe("GET /api/productos/resumen", () => {
    it("devuelve los indicadores del dashboard", async () => {
      await montarEscenario([{ nombre: "Gaseosa", precioVenta: 3.5, categoriaId: 1 }]);

      const respuesta = await autorizado(request(app).get("/api/productos/resumen"));

      expect(respuesta.status).toBe(200);
      expect(respuesta.body).toEqual({ totalProductos: 1, totalCategorias: 3, valorInventario: 3.5 });
    });
  });

  describe("PATCH /api/productos/:id", () => {
    beforeEach(() => montarEscenario([{ nombre: "Gaseosa", descripcion: "Antes", precioVenta: 3, categoriaId: 1 }]));

    it("actualiza los campos enviados", async () => {
      const respuesta = await autorizado(request(app).patch("/api/productos/1")).field({ precioVenta: "4.99" });

      expect(respuesta.status).toBe(200);
      expect(respuesta.body).toMatchObject({ precioVenta: 4.99, nombre: "Gaseosa", descripcion: "Antes" });
    });

    it("cambia la categoría del producto", async () => {
      const respuesta = await autorizado(request(app).patch("/api/productos/1")).field({ categoriaId: "2" });

      expect(respuesta.body.categoria.nombre).toBe("Mascotas");
    });

    it("acepta una actualización compuesta solo por la imagen", async () => {
      const respuesta = await autorizado(request(app).patch("/api/productos/1")).attach(
        "imagen",
        escribirArchivo(PNG_MINIMO),
      );

      expect(respuesta.status).toBe(200);
      expect(respuesta.body.imagenUrl).toContain("/uploads/");
    });

    it("rechaza mover el producto a una categoría no disponible", async () => {
      const respuesta = await autorizado(request(app).patch("/api/productos/1")).field({ categoriaId: "999" });

      expect(respuesta.status).toBe(400);
      expect(respuesta.body.error.codigo).toBe("CATEGORIA_NO_DISPONIBLE");
    });

    it("responde 400 si no se envía ningún campo", async () => {
      const respuesta = await autorizado(request(app).patch("/api/productos/1"));

      expect(respuesta.status).toBe(400);
      expect(respuesta.body.error.mensaje).toBe("Debes enviar al menos un campo para actualizar");
    });

    it("responde 404 si el producto no existe", async () => {
      const respuesta = await autorizado(request(app).patch("/api/productos/99")).field({ nombre: "Nuevo" });

      expect(respuesta.status).toBe(404);
    });
  });

  describe("DELETE /api/productos/:id", () => {
    beforeEach(() => montarEscenario([{ nombre: "Gaseosa", precioVenta: 3, categoriaId: 1 }]));

    it("realiza la baja lógica y el producto deja de estar disponible", async () => {
      const respuesta = await autorizado(request(app).delete("/api/productos/1"));

      expect(respuesta.status).toBe(200);
      expect(respuesta.body.mensaje).toBe("El producto fue eliminado correctamente");
      await autorizado(request(app).get("/api/productos/1")).expect(404);

      const listado = await autorizado(request(app).get("/api/productos"));
      expect(listado.body.productos).toHaveLength(0);
    });

    it("responde 404 si el producto ya fue eliminado", async () => {
      await autorizado(request(app).delete("/api/productos/1")).expect(200);

      const respuesta = await autorizado(request(app).delete("/api/productos/1"));

      expect(respuesta.status).toBe(404);
    });
  });
});
