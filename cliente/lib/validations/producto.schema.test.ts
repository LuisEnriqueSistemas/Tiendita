import { describe, expect, it } from "vitest";
import {
  LIMITE_IMAGEN_BYTES,
  productoParcialSchema,
  productoSchema,
} from "@/lib/validations/producto.schema";

const datosValidos = {
  nombre: "Gaseosa cola 2L",
  descripcion: "Bebida gaseosa",
  categoriaId: 1,
  precioProveedor: "1,50",
  precioVenta: "3200",
};

describe("productoSchema", () => {
  it("acepta coma y punto como separador decimal", () => {
    expect(productoSchema.parse(datosValidos).precioProveedor).toBe(1.5);
    expect(productoSchema.parse({ ...datosValidos, precioVenta: "3.25" }).precioVenta).toBe(3.25);
  });

  it("rechaza más de dos decimales", () => {
    expect(productoSchema.safeParse({ ...datosValidos, precioVenta: "10.999" }).success).toBe(false);
  });

  it("exige un nombre de al menos 2 caracteres", () => {
    const resultado = productoSchema.safeParse({ ...datosValidos, nombre: "G" });

    expect(resultado.success).toBe(false);
    expect(resultado.error?.issues[0].message).toContain("2 caracteres");
  });

  it("rechaza precios cero, negativos o no numéricos", () => {
    expect(productoSchema.safeParse({ ...datosValidos, precioVenta: "0" }).success).toBe(false);
    expect(productoSchema.safeParse({ ...datosValidos, precioVenta: "-5" }).success).toBe(false);
    expect(productoSchema.safeParse({ ...datosValidos, precioVenta: "abc" }).success).toBe(false);
  });

  it("exige una categoría válida", () => {
    expect(productoSchema.safeParse({ ...datosValidos, categoriaId: undefined }).success).toBe(false);
    expect(productoSchema.safeParse({ ...datosValidos, categoriaId: "1" }).success).toBe(true);
  });

  it("acepta el formulario sin imagen", () => {
    const resultado = productoSchema.safeParse({ ...datosValidos, imagen: undefined });

    expect(resultado.success).toBe(true);
  });

  it("rechaza una imagen mayor a 5 MB", () => {
    const grande = new File(["x"], "grande.png", { type: "image/png" });
    Object.defineProperty(grande, "size", { value: LIMITE_IMAGEN_BYTES + 1 });

    const resultado = productoSchema.safeParse({ ...datosValidos, imagen: grande });

    expect(resultado.success).toBe(false);
    expect(resultado.error?.issues[0].message).toContain("5 MB");
  });

  it("rechaza un tipo de imagen no admitido", () => {
    const resultado = productoSchema.safeParse({
      ...datosValidos,
      imagen: new File(["x"], "documento.pdf", { type: "application/pdf" }),
    });

    expect(resultado.success).toBe(false);
    expect(resultado.error?.issues[0].message).toContain("JPG, PNG o WebP");
  });
});

describe("productoParcialSchema", () => {
  it("acepta una actualización con un único campo", () => {
    expect(productoParcialSchema.safeParse({ precioVenta: "4200" }).success).toBe(true);
  });

  it("exige que se modifique al menos un campo", () => {
    const resultado = productoParcialSchema.safeParse({});

    expect(resultado.success).toBe(false);
    expect(resultado.error?.issues[0].message).toContain("al menos un campo");
  });

  it("acepta una actualización compuesta solo por la imagen", () => {
    const imagen = new File(["x"], "gaseosa.webp", { type: "image/webp" });

    expect(productoParcialSchema.safeParse({ imagen }).success).toBe(true);
  });
});
