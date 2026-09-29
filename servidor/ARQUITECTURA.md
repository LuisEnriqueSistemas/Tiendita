# Estructura del proyecto

```text
servidor/
├── src/
│   ├── config/
│   │   └── db.js              # conexión a la base de datos
│   │
│   ├── routes/
│   │   ├── productos.routes.js
│   │   ├── usuarios.routes.js
│   │   └── pedidos.routes.js
│   │
│   ├── controllers/
│   │   ├── productos.controller.js
│   │   ├── usuarios.controller.js
│   │   └── pedidos.controller.js
│   │
│   ├── services/
│   │   ├── productos.service.js
│   │   ├── usuarios.service.js
│   │   └── pedidos.service.js
│   │
│   ├── repositories/          # (o "models" si usas ORM)
│   │   ├── productos.repo.js
│   │   ├── usuarios.repo.js
│   │   └── pedidos.repo.js
│   │
│   ├── middlewares/
│   │   ├── auth.js            # verificar token
│   │   ├── errorHandler.js    # manejo central de errores
│   │   └── validate.js        # validar body/params
│   │
│   ├── utils/
│   │   ├── ApiError.js        # clase para errores controlados
│   │   └── hash.js            # bcrypt helpers
│   │
│   ├── app.js                 # configura express, cors, rutas
│   └── server.js              # arranca el servidor
│
├── .env
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## Descripción de carpetas

| Carpeta/Archivo | Descripción |
|-----------------|-------------|
| `config/`       | Configuración general (conexión a BD, variables, etc.) |
| `routes/`       | Definición de endpoints por recurso |
| `controllers/`  | Manejo de `req`/`res`, orquestación |
| `services/`     | Lógica de negocio |
| `repositories/` | Acceso a datos (o `models/` si usas ORM) |
| `middlewares/`  | Funciones intermedias (auth, errores, validación) |
| `utils/`        | Utilidades reutilizables |
| `app.js`        | Configuración de Express |
| `server.js`     | Punto de entrada del servidor |
