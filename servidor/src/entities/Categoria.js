import { EntitySchema } from "typeorm";

export const Categoria = new EntitySchema({
  name: "Categoria",
  tableName: "categorias",
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
      unique: true,
    },
    descripcion: {
      type: "text",
      nullable: true,
    },
    // Toda categoría precargada es fija: el usuario no la crea ni la modifica.
    esFija: {
      type: "boolean",
      default: true,
    },
    activo: {
      type: "boolean",
      default: true,
    },
    creadoEn: {
      type: "timestamp",
      createDate: true,
    },
    actualizadoEn: {
      type: "timestamp",
      updateDate: true,
    },
  },
});
