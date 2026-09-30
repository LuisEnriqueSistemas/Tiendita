# Tiendita

Aplicación para el registro y almacenamiento de datos de productos de una tienda.

## Estructura

- `servidor/` — API REST en Node.js + Express + TypeORM (JavaScript ESM).
- `cliente/` — Frontend en Next.js (App Router) + TailwindCSS.
- `requirements/` — Documentación funcional de los módulos.

## Módulo Gestión de Cuentas

Implementa los casos de uso CU-01 (registro), CU-02 (autenticación),
CU-03 (recuperación de contraseña) y CU-04 (gestión del perfil).

Detalle de la API en `servidor/ARQUITECTURA.md`.

## Módulo Catálogo (Categorías y Productos)

- **Categorías (CU-09)**: catálogo fijo de 14 categorías precargado al arrancar el
  servidor. Solo lectura.
- **Productos (CU-05 a CU-08)**: alta, consulta, edición y baja lógica, con
  búsqueda por nombre, filtro por categoría, orden, paginación e imagen.
- **Dashboard**: KPIs (total de productos, categorías, valor de inventario) y
  cards del catálogo con los mismos filtros del listado.

Las imágenes se reciben como `multipart/form-data` en el campo `imagen`
(máximo 5 MB; `image/jpeg`, `image/png` o `image/webp`) y se publican en
`/uploads`. Los productos dados de baja se conservan en la base de datos con
`activo = false`.

Detalle de la API en `servidor/ARQUITECTURA.md`.

## Puesta en marcha

### 1. Servidor

```bash
cd servidor
cp .env.example .env   # completar credenciales de PostgreSQL, JWT y SMTP
npm install
npm run dev             # http://localhost:4000/api
```

### 2. Cliente

```bash
cd cliente
npm install
cp .env.local.example .env.local
npm run dev             # http://localhost:3000
```

## Pruebas

```bash
cd servidor && npm test               # 157 pruebas (unitarias + integración Supertest)
cd servidor && npm run test:coverage  # cobertura con umbral mínimo de 80 %
cd cliente  && npm test               # 74 pruebas (servicios, store, esquemas, componentes)
cd cliente  && npm run typecheck      # TypeScript sin errores
cd cliente  && npm run lint           # ESLint
cd cliente  && npm run build          # build de producción
```

## Variables de entorno

`servidor/.env`

| Variable | Descripción |
|----------|-------------|
| `DB_*` | Conexión a PostgreSQL |
| `JWT_SECRET` / `JWT_RECOVERY_SECRET` | Firmas de los tokens de sesión y de recuperación |
| `JWT_EXPIRES_IN` / `RECOVERY_TOKEN_TTL_MIN` | Vigencia de la sesión y del enlace de recuperación |
| `SMTP_*` / `MAIL_FROM` | Envío del correo de recuperación |
| `CLIENT_URL` | Origen permitido por CORS y base de los enlaces |
| `PUBLIC_BASE_URL` | Base absoluta de `imagenUrl` (por ejemplo `http://localhost:4000`) |
| `UPLOADS_DIR` / `UPLOADS_MAX_SIZE_MB` / `UPLOADS_MIME_TYPES` | Imágenes de productos: directorio, tamaño máximo y MIME permitidos |

`cliente/.env.local`

| Variable | Descripción |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | URL base de la API (por ejemplo `http://localhost:4000/api`) |
