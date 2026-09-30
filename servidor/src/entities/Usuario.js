import { EntitySchema } from "typeorm";

export const Usuario = new EntitySchema({
  name: "Usuario",
  tableName: "usuarios",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true,
    },
    nombre: {
      type: "varchar",
      length: 150,
      nullable: false,
    },
    email: {
      type: "varchar",
      length: 255,
      nullable: false,
      unique: true,
    },
    passwordHash: {
      type: "varchar",
      length: 255,
      nullable: false,
    },
    resetToken: {
      type: "varchar",
      length: 512,
      nullable: true,
    },
    resetTokenExpiresAt: {
      type: "timestamp",
      nullable: true,
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
      createDate: true,
    },
    actualizadoEn: {
      type: "timestamp",
      updateDate: true,
    },
  },
});
