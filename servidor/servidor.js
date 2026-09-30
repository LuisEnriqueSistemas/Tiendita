import "dotenv/config";
import { config, validarConfig } from "./src/config/config.js";
import { AppDataSource } from "./src/config/data-source.js";
import { crearContenedor } from "./src/utils/container.util.js";
import { crearApp } from "./app.js";

const { host, port } = config.server;

async function start() {
  try {
    validarConfig();
  } catch (error) {
    console.error(`❌ ${error.message}`);
    process.exit(1);
  }

  try {
    await AppDataSource.initialize();
    const { host: dbHost, port: dbPort, database } = AppDataSource.options;
    console.log(`✅ PostgreSQL conectado → ${dbHost}:${dbPort}/${database}`);

    const contenedor = crearContenedor({ dataSource: AppDataSource });

    // Precarga idempotente del catálogo fijo de categorías.
    const categorias = await contenedor.categoriaService.precargar();
    console.log(`🗂️  ${categorias.length} categorías disponibles en el catálogo`);

    const app = crearApp({ contenedor });

    app.listen(port, host, () => {
      console.log(`🚀 Server running at http://${host}:${port}/`);
      console.log(`📡 API disponible en http://${host}:${port}/api`);
      console.log(`🖼️  Imágenes de productos en http://${host}:${port}${config.uploads.publicPath}`);
    });
  } catch (err) {
    console.error("❌ Error al iniciar el servidor:", err);
    process.exit(1);
  }
}

start();
