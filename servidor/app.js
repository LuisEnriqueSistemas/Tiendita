import cors from "cors";
import express from "express";
import { config } from "./src/config/config.js";
import { manejarErrores, rutaNoEncontrada } from "./src/middlewares/error.middleware.js";
import { crearRoutes } from "./src/routes/index.js";

/**
 * Construye la aplicación Express.
 * @param {{ contenedor: ReturnType<import("./src/utils/container.util.js").crearContenedor> }} opciones
 */
export const crearApp = ({ contenedor }) => {
  const app = express();

  // Imágenes de productos servidas desde disco.
  app.use(config.uploads.publicPath, express.static(config.uploads.dir));

  // Middlewares globales
  app.use(cors({ origin: config.server.clientUrl, credentials: false }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Rutas de la API
  app.use("/api", crearRoutes(contenedor));

  // Manejo centralizado de errores
  app.use(rutaNoEncontrada);
  app.use(manejarErrores);

  return app;
};

export default crearApp;
