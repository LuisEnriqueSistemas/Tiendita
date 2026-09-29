import { EntitySchema } from "typeorm";

export const Producto = new EntitySchema({
  name: "Producto",         // nombre interno en TypeORM
  tableName: "productos",   // nombre real de la tabla en Postgres
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
      nullable: true,       // puede no tener imagen al inicio
    },
    descripcion: {
      type: "text",
      nullable: true,       // es opcional
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
    creadoEn: {
      type: "timestamp",
      createDate: true,     // se rellena solo al crear
    },
  },
});