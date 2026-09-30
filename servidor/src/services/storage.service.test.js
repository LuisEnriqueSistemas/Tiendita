import { existsSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { beforeEach, describe, expect, it } from "vitest";
import { AlmacenamientoDiscoLocal, StorageServiceInterface } from "./storage.service.js";

describe("StorageServiceInterface", () => {
  it("exige una implementación explícita", async () => {
    class AlmacenamientoVacio extends StorageServiceInterface {}

    const servicio = new AlmacenamientoVacio();
    await expect(servicio.guardar({ filename: "a.png" })).rejects.toThrow("No implementado");
    await expect(servicio.eliminar("a.png")).rejects.toThrow("No implementado");
  });
});

describe("AlmacenamientoDiscoLocal", () => {
  let directorio;
  let servicio;

  beforeEach(() => {
    directorio = mkdtempSync(path.join(tmpdir(), "tienda-uploads-"));
    servicio = new AlmacenamientoDiscoLocal({ dir: directorio, publicPath: "/uploads" });
  });

  it("devuelve la ruta pública a partir del nombre generado por multer", async () => {
    const ruta = await servicio.guardar({ filename: "9f2c.webp" });

    expect(ruta).toBe("/uploads/9f2c.webp");
  });

  it("elimina el archivo almacenado", async () => {
    const archivo = path.join(directorio, "9f2c.webp");
    writeFileSync(archivo, "contenido");

    await servicio.eliminar("/uploads/9f2c.webp");

    expect(existsSync(archivo)).toBe(false);
  });

  it("no falla si el archivo ya no existe", async () => {
    await expect(servicio.eliminar("/uploads/no-existe.webp")).resolves.toBeUndefined();
  });

  it("ignora la petición cuando el producto no tiene imagen", async () => {
    await expect(servicio.eliminar(null)).resolves.toBeUndefined();
    await expect(servicio.eliminar("")).resolves.toBeUndefined();
  });

  it("no elimina archivos fuera del directorio de subidas", async () => {
    const fuera = path.join(directorio, "..", `protegido-${path.basename(directorio)}.txt`);
    writeFileSync(fuera, "no tocar");

    await servicio.eliminar(fuera);

    expect(existsSync(fuera)).toBe(true);
  });
});
