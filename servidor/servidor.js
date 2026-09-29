import "dotenv/config";
import app from './app.js';
import { AppDataSource } from './src/config/data-source.js';

const host = process.env.HOST || "127.0.0.1";
const port = process.env.PORT || 3000;

async function start() {
  try {
    await AppDataSource.initialize();
    const { host: dbHost, port: dbPort, database } = AppDataSource.options;
    console.log(`✅ PostgreSQL conectado → ${dbHost}:${dbPort}/${database}`);

    app.listen(port, host, () => {
      console.log(`🚀 Server running at http://${host}:${port}/`);
    });
  } catch (err) {
    console.error('❌ Error al conectar a la base de datos:', err);
    process.exit(1);
  }
}

start();