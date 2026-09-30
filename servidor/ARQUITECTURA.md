# Estructura del proyecto — Backend

```text
servidor/
├── src/
│   ├── config/
│   │   ├── config.js                  # variables de entorno tipadas y validación
│   │   └── data-source.js             # conexión a la base de datos (TypeORM)
│   │
│   ├── constants/
│   │   ├── categorias-precargadas.js  # catálogo fijo de 14 categorías
│   │   ├── codigos-error.js           # códigos de error estables del contrato HTTP
│   │   ├── orden-productos.js         # whitelist de orden del listado
│   │   └── password-policy.js         # MIN_PASSWORD_LENGTH
│   │
│   ├── entities/
│   │   ├── Categoria.js               # catálogo precargado de solo lectura
│   │   ├── Producto.js                # producto del catálogo (baja lógica)
│   │   └── Usuario.js                 # entidad de cuentas (baja lógica)
│   │
│   ├── routes/
│   │   ├── index.js                   # composition root de rutas
│   │   ├── auth.routes.js             # CU-01, CU-02, CU-03
│   │   ├── categoria.routes.js        # CU-09 (requiere sesión)
│   │   ├── producto.routes.js         # CU-05 a CU-08 (requiere sesión)
│   │   ├── usuario.routes.js          # CU-04 (requiere sesión)
│   │   ├── cuentas.routes.spec.js     # integración Supertest de cuentas
│   │   └── catalogo.routes.spec.js    # integración Supertest del catálogo
│   │
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── categoria.controller.js
│   │   ├── producto.controller.js
│   │   └── usuario.controller.js
│   │
│   ├── services/
│   │   ├── auth.service.js            # lógica de negocio de CU-01, CU-02 y CU-03
│   │   ├── usuario.service.js         # lógica de negocio de CU-04
│   │   ├── categoria.service.js       # consulta del catálogo fijo y validación de existencia
│   │   ├── producto.service.js        # CU-05 a CU-08, margen y DTO público
│   │   ├── storage.service.js         # interfaz + implementación de imágenes en disco
│   │   ├── hash.service.js            # interfaz + implementación BCrypt
│   │   ├── jwt.service.js             # interfaz + implementación jsonwebtoken
│   │   └── mail.service.js            # interfaz + implementación nodemailer
│   │
│   ├── repositories/
│   │   ├── usuario.repository.interface.js     # contrato de persistencia
│   │   ├── usuario.typeorm.repository.js       # implementación TypeORM
│   │   ├── categoria.repository.interface.js
│   │   ├── categoria.typeorm.repository.js     # consulta y precarga idempotente
│   │   ├── producto.repository.interface.js
│   │   └── producto.typeorm.repository.js      # filtros, orden, paginación y agregados
│   │
│   ├── middlewares/
│   │   ├── auth.middleware.js         # verificación del token de sesión
│   │   ├── validate.middleware.js     # validación con Zod
│   │   ├── upload.middleware.js       # multipart de imágenes con multer
│   │   └── error.middleware.js        # manejo centralizado de errores
│   │
│   ├── schemas/
│   │   ├── auth.schema.js
│   │   ├── producto.schema.js         # validaciones de alta, edición e imagen
│   │   └── usuario.schema.js
│   │
│   ├── utils/
│   │   ├── ApiError.util.js           # error de dominio
│   │   ├── container.util.js          # composition root (inyección de dependencias)
│   │   └── duracion.util.js           # conversión de duraciones JWT a segundos
│   │
│   └── tests/                         # dobles en memoria para las pruebas
│
├── app.js                             # fábrica de la app Express
├── servidor.js                        # punto de entrada
├── uploads/                           # imágenes de productos (fuera de Git)
└── package.json
```

## Descripción de carpetas

| Carpeta/Archivo | Descripción |
|-----------------|-------------|
| `config/`       | Configuración general (conexión a BD, variables de entorno) |
| `constants/`    | Constantes de dominio compartidas |
| `entities/`     | Entidades persistidas en PostgreSQL (TypeORM `EntitySchema`) |
| `routes/`       | Definición de endpoints por recurso |
| `controllers/`  | Manejo de `req`/`res` y orquestación, sin lógica de negocio |
| `services/`     | Lógica de negocio y servicios de infraestructura (hash, JWT, correo) |
| `repositories/` | Contrato de acceso a datos y su implementación TypeORM |
| `middlewares/`  | Autenticación, validación y manejo de errores |
| `schemas/`      | Esquemas de validación Zod |
| `utils/`        | Utilidades reutilizables y composition root |
| `tests/`        | Dobles de prueba en memoria (sin red ni base de datos) |

## Endpoints del módulo de cuentas

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/auth/registro` | CU-01. Crear cuenta (201) |
| POST | `/api/auth/login` | CU-02. Autenticar y devolver token (200) |
| POST | `/api/auth/recuperar-contrasena` | CU-03. Solicitar enlace (202, respuesta genérica) |
| GET | `/api/auth/validar-token-recuperacion` | CU-03. Comprobar vigencia del enlace (200/400) |
| POST | `/api/auth/restablecer-contrasena` | CU-03. Actualizar contraseña (200/400) |
| GET | `/api/usuarios/mi-perfil` | CU-04. Consultar perfil (requiere sesión) |
| PATCH | `/api/usuarios/mi-perfil` | CU-04. Actualizar datos (requiere sesión) |
| DELETE | `/api/usuarios/mi-perfil` | CU-04. Baja lógica de la cuenta (requiere sesión) |
| GET | `/api/salud` | Verificación del servicio |

## Endpoints del módulo Catálogo (Categorías y Productos)

Todas las rutas requieren `Authorization: Bearer <token>`.

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/categorias` | CU-09. Catálogo fijo de categorías activas (14) |
| GET | `/api/productos` | CU-06. Listado con `nombre`, `categoriaId`, `pagina`, `limite` y `orden` |
| GET | `/api/productos/resumen` | KPIs del dashboard: totales y valor de inventario |
| GET | `/api/productos/:id` | CU-06. Detalle de un producto activo |
| POST | `/api/productos` | CU-05. Alta `multipart/form-data` con campo `imagen` (201) |
| PATCH | `/api/productos/:id` | CU-07. Edición parcial; permite reemplazar o no la imagen |
| DELETE | `/api/productos/:id` | CU-08. Baja lógica del producto (200) |
| GET | `/uploads/:archivo` | Imagen pública del producto (estática) |

La proyección pública del producto expone `id`, `nombre`, `descripcion`,
`imagenUrl`, `precioProveedor`, `precioVenta`, `margen` (calculado en el
backend), `categoriaId`, `categoria` (`{ id, nombre }`), `activo`, `creadoEn`
y `actualizadoEn`. La categoría expone `id`, `nombre` y `descripcion`.

Valores de `orden`: `recientes`, `nombre_asc`, `nombre_desc`,
`precio_venta_asc`, `precio_venta_desc`.

## Contrato de error

```json
{
  "error": {
    "codigo": "EMAIL_YA_REGISTRADO",
    "mensaje": "El correo electrónico ya se encuentra registrado",
    "detalles": [{ "campo": "email", "mensaje": "..." }]
  }
}
```

## Comandos

```bash
npm run dev            # servidor con nodemon
npm start              # servidor con node
npm test               # pruebas unitarias e integración (Vitest + Supertest)
npm run test:coverage  # cobertura con umbral mínimo de 80 %
```
