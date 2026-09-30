import "reflect-metadata";
import "dotenv/config";
import { DataSource } from "typeorm";
import { Categoria } from "../entities/Categoria.js";
import { Producto } from "../entities/Producto.js";
import { Usuario } from "../entities/Usuario.js";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  username: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  database: process.env.DB_NAME || "tienda",
  synchronize: true, // ⚠️ true SOLO en desarrollo/aprendizaje
  logging: false,
  entities: [Categoria, Producto, Usuario], // array explícito, sin globs
});
