import { EntitySchema } from "typeorm";
import { Categoria } from "./Categoria.js";

export const Producto = new EntitySchema({
  name: "Producto",
  tableName: "productos",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true,
    },
    nombre: {
      type: "varchar",
      length: 100,
      nullable: false,
    },
    imagen: {
      type: "varchar",
      length: 255,
      nullable: true, // puede no tener imagen al inicio
    },
    descripcion: {
      type: "text",
      nullable: true, // es opcional
    },
    precioProveedor: {
      type: "decimal",
      precision: 10,
      scale: 2,
      nullable: false,
    },
    precioVenta: {
      type: "decimal",
      precision: 10,
      scale: 2,
      nullable: false,
    },
    // Referencia a la categoría del Módulo de Categorías (obligatoria).
    categoriaId: {
      type: "int",
      nullable: false,
    },
    activo: {
      type: "boolean",
      default: true,
    },
    eliminadoEn: {
      type: "timestamp",
      nullable: true,
    },
    creadoEn: {
      type: "timestamp",
      createDate: true, // se rellena solo al crear
    },
    actualizadoEn: {
      type: "timestamp",
      updateDate: true,
    },
  },
  relations: {
    categoria: {
      type: "many-to-one",
      target: Categoria,
      // `eager` evita tener que declarar el join en cada consulta del repositorio.
      eager: true,
      nullable: false,
      onDelete: "RESTRICT",
      joinColumn: {
        name: "categoriaId",
        referencedColumnName: "id",
      },
    },
  },
});
