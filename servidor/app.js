import express from 'express';
import cors from 'cors';
import multer  from 'multer';

const app = express();

// middlewares globales
app.use(cors());
app.use(express.json()); // para leer req.body en JSON

// rutas de prueba
/*app.get("/dame", (req, res) => {
  res.send("si da");
});*/

// (más adelante) app.use('/api/productos', productosRoutes);

export default app;