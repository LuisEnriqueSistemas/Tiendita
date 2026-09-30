import "dotenv/config";

const leerEntero = (valor, porDefecto) => {
  const numero = Number.parseInt(valor ?? "", 10);
  return Number.isNaN(numero) ? porDefecto : numero;
};

const leerBooleano = (valor, porDefecto) => {
  if (valor === undefined || valor === null || valor === "") return porDefecto;
  return valor === "true";
};

/** Lee una lista separada por comas; si no hay valor, usa la lista por defecto. */
const leerLista = (valor, porDefecto) => {
  const items = (valor ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  return items.length > 0 ? items : porDefecto;
};

export const config = {
  server: {
    host: process.env.HOST || "127.0.0.1",
    port: leerEntero(process.env.PORT, 4000),
    clientUrl: process.env.CLIENT_URL || "http://localhost:3000",
    publicBaseUrl: process.env.PUBLIC_BASE_URL || "http://localhost:4000",
    nodeEnv: process.env.NODE_ENV || "development",
  },
  database: {
    host: process.env.DB_HOST || "localhost",
    port: leerEntero(process.env.DB_PORT, 5432),
    username: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "postgres",
    database: process.env.DB_NAME || "tienda",
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || "1h",
    recoverySecret: process.env.JWT_RECOVERY_SECRET || process.env.JWT_SECRET,
    recoveryExpiresIn: process.env.JWT_RECOVERY_EXPIRES_IN || "30m",
  },
  password: {
    minLength: leerEntero(process.env.PASSWORD_MIN_LENGTH, 8),
    saltRounds: leerEntero(process.env.BCRYPT_SALT_ROUNDS, 10),
  },
  recovery: {
    tokenTtlMinutes: leerEntero(process.env.RECOVERY_TOKEN_TTL_MIN, 30),
  },
  mail: {
    host: process.env.SMTP_HOST,
    port: leerEntero(process.env.SMTP_PORT, 587),
    secure: leerBooleano(process.env.SMTP_SECURE, false),
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.MAIL_FROM || "no-reply@tienda.local",
  },
  uploads: {
    // Ruta relativa a la raíz del servidor; se resuelve con `path.resolve`.
    dir: process.env.UPLOADS_DIR || "uploads",
    // Prefijo público para construir la URL de la imagen en las respuestas.
    publicPath: "/uploads",
    maxSizeBytes: leerEntero(process.env.UPLOADS_MAX_SIZE_MB, 5) * 1024 * 1024,
    mimeTypes: leerLista(process.env.UPLOADS_MIME_TYPES, [
      "image/jpeg",
      "image/png",
      "image/webp",
    ]),
  },
};

/**
 * Verifica que las variables sensibles estén configuradas.
 * Se invoca desde el punto de entrada (servidor.js), no al importar el módulo,
 * para que las pruebas puedan construir el contenedor con valores propios.
 */
export const validarConfig = () => {
  const faltantes = [];
  if (!config.jwt.secret) faltantes.push("JWT_SECRET");
  if (!config.mail.host) faltantes.push("SMTP_HOST");
  if (!config.mail.user) faltantes.push("SMTP_USER");
  if (!config.mail.pass) faltantes.push("SMTP_PASS");
  if (faltantes.length > 0) {
    throw new Error(`Faltan variables de entorno requeridas: ${faltantes.join(", ")}`);
  }
};
