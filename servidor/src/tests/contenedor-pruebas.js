import { crearContenedor } from "../utils/container.util.js";
import { CategoriaRepositoryFake } from "./categoria-repository.fake.js";
import { BcryptHashService } from "../services/hash.service.js";
import { JsonWebTokenService } from "../services/jwt.service.js";
import { MailServiceFake } from "./mail-service.fake.js";
import { ProductoRepositoryFake } from "./producto-repository.fake.js";
import { StorageServiceFake } from "./storage-service.fake.js";
import { UsuarioRepositoryFake } from "./usuario-repository.fake.js";

export const CLAVE_PRUEBA = "clave-segura-de-pruebas";
export const CLAVE_RECUPERACION_PRUEBA = "clave-recuperacion-de-pruebas";

/** Catálogo mínimo de categorías usado por las pruebas del catálogo. */
export const CATEGORIAS_PRUEBA = [
  { id: 1, nombre: "Bebidas", descripcion: "Productos líquidos" },
  { id: 2, nombre: "Mascotas", descripcion: "Alimento y accesorios" },
  { id: 3, nombre: "Otros", descripcion: "Sin categoría clara" },
];

const construirConfig = (sobrescrituras = {}) => ({
  server: {
    host: "127.0.0.1",
    port: 0,
    clientUrl: "http://localhost:3000",
    publicBaseUrl: "http://localhost:4000",
    nodeEnv: "test",
  },
  jwt: { secret: CLAVE_PRUEBA, recoverySecret: CLAVE_RECUPERACION_PRUEBA, expiresIn: "1h" },
  password: { minLength: 8, saltRounds: 4 },
  recovery: { tokenTtlMinutes: 30 },
  mail: {},
  uploads: {
    dir: "uploads",
    publicPath: "/uploads",
    maxSizeBytes: 5 * 1024 * 1024,
    mimeTypes: ["image/jpeg", "image/png", "image/webp"],
  },
  ...sobrescrituras,
});

/**
 * Construye el contenedor con dependencias aisladas de red, disco y base de datos.
 * @param {object} [opciones]
 * @param {object[]} [opciones.usuarios] Usuarios iniciales.
 * @param {object[]} [opciones.categorias] Categorías iniciales.
 * @param {object[]} [opciones.productos] Productos iniciales.
 * @param {object} [opciones.config] Ajustes de configuración.
 */
export const crearContenedorDePruebas = ({
  usuarios = [],
  categorias = CATEGORIAS_PRUEBA,
  productos = [],
  config: ajustes = {},
} = {}) => {
  const usuarioRepository = new UsuarioRepositoryFake(usuarios);
  const categoriaRepository = new CategoriaRepositoryFake(categorias);
  const productoRepository = new ProductoRepositoryFake(productos, categorias);
  const mailService = new MailServiceFake();
  const storageService = new StorageServiceFake();

  const config = construirConfig(ajustes);

  const contenedor = crearContenedor({
    config,
    usuarioRepository,
    categoriaRepository,
    productoRepository,
    mailService,
    storageService,
    hashService: new BcryptHashService(config.password.saltRounds),
    jwtService: new JsonWebTokenService({
      secret: config.jwt.secret,
      recoverySecret: config.jwt.recoverySecret,
      expiresIn: config.jwt.expiresIn,
    }),
  });

  return { ...contenedor, mailService, storageService, config };
};

/**
 * Registra un usuario en el repositorio en memoria con la contraseña cifrada.
 * @param {object} contenedor Contenedor de pruebas.
 * @param {{ nombre?: string, email?: string, password?: string } & Record<string, unknown>} [datos]
 */
export const registrarUsuario = async (
  contenedor,
  { nombre = "Encargado Demo", email = "encargado@tienda.com", password = "ClaveSegura1", ...resto } = {},
) =>
  contenedor.usuarioRepository.crear({
    nombre,
    email,
    ...resto,
    passwordHash: await contenedor.hashService.hash(password),
  });

/**
 * Genera un token de sesión válido para las peticiones HTTP de prueba.
 * @param {object} contenedor Contenedor de pruebas.
 * @param {{ userId: number, email: string }} usuario
 */
export const tokenDe = (contenedor, usuario) => contenedor.jwtService.firmarSesion(usuario);
