import { config as configPorDefecto } from "../config/config.js";
import { AppDataSource } from "../config/data-source.js";
import { CategoriaTypeOrmRepository } from "../repositories/categoria.typeorm.repository.js";
import { ProductoTypeOrmRepository } from "../repositories/producto.typeorm.repository.js";
import { UsuarioTypeOrmRepository } from "../repositories/usuario.typeorm.repository.js";
import { AuthService } from "../services/auth.service.js";
import { CategoriaService } from "../services/categoria.service.js";
import { BcryptHashService } from "../services/hash.service.js";
import { JsonWebTokenService } from "../services/jwt.service.js";
import { NodemailerMailService } from "../services/mail.service.js";
import { ProductoService } from "../services/producto.service.js";
import { AlmacenamientoDiscoLocal } from "../services/storage.service.js";
import { UsuarioService } from "../services/usuario.service.js";

/**
 * Composition root de la aplicación.
 * Centraliza la construcción de dependencias para evitar instanciaciones
 * directas dentro de controladores y servicios.
 *
 * @param {Object} [dependencias] Dependencias a sustituir en las pruebas.
 * @param {import("typeorm").DataSource} [dependencias.dataSource]
 * @param {import("../config/config.js").config} [dependencias.config]
 */
export const crearContenedor = ({
  dataSource = AppDataSource,
  config = configPorDefecto,
  usuarioRepository,
  categoriaRepository,
  productoRepository,
  hashService,
  jwtService,
  mailService,
  storageService,
} = {}) => {
  const usuarios = usuarioRepository ?? new UsuarioTypeOrmRepository(dataSource);

  const categorias = categoriaRepository ?? new CategoriaTypeOrmRepository(dataSource);

  const productos = productoRepository ?? new ProductoTypeOrmRepository(dataSource);

  const hash = hashService ?? new BcryptHashService(config.password.saltRounds);

  const jwt =
    jwtService ??
    new JsonWebTokenService({
      secret: config.jwt.secret,
      recoverySecret: config.jwt.recoverySecret,
      expiresIn: config.jwt.expiresIn,
    });

  const mail = mailService ?? new NodemailerMailService(config.mail);

  const almacenamiento =
    storageService ?? new AlmacenamientoDiscoLocal({ dir: config.uploads.dir, publicPath: config.uploads.publicPath });

  const categoriaService = new CategoriaService({ categoriaRepository: categorias });

  return {
    config,
    usuarioRepository: usuarios,
    categoriaRepository: categorias,
    productoRepository: productos,
    hashService: hash,
    jwtService: jwt,
    mailService: mail,
    storageService: almacenamiento,
    authService: new AuthService({
      usuarioRepository: usuarios,
      hashService: hash,
      jwtService: jwt,
      mailService: mail,
      config,
    }),
    usuarioService: new UsuarioService({ usuarioRepository: usuarios, hashService: hash }),
    categoriaService,
    productoService: new ProductoService({
      productoRepository: productos,
      categoriaService,
      storageService: almacenamiento,
      config,
    }),
  };
};
