/**
 * Catálogo fijo de categorías de la tienda (datos precargados / quemados).
 * El módulo de Categorías no permite crearlas, modificarlas ni eliminarlas,
 * por lo que el listado se define aquí y se precarga al arrancar el servidor.
 */
export const CATEGORIAS_PRECARGADAS = Object.freeze([
  { nombre: "Bebidas", descripcion: "Agua, gaseosas, jugos, energizantes, café y té" },
  { nombre: "Alimentos", descripcion: "Arroz, fideos, aceite, conservas y condimentos" },
  { nombre: "Dulces y Snacks", descripcion: "Galletas, chocolates, caramelos y papas fritas" },
  { nombre: "Frutas y Verduras", descripcion: "Manzanas, plátanos, tomates y cebollas" },
  { nombre: "Panadería y Repostería", descripcion: "Pan, masas, tortas y productos horneados" },
  { nombre: "Limpieza", descripcion: "Detergente, jabón, desinfectante y esponjas" },
  { nombre: "Artículos del Hogar", descripcion: "Papel higiénico, servilletas, bolsas y encendedores" },
  { nombre: "Higiene Personal", descripcion: "Shampoo, pasta dental, cepillos y desodorantes" },
  { nombre: "Mascotas", descripcion: "Alimento para perros y gatos y arena para gatos" },
  { nombre: "Papelería y Oficina", descripcion: "Cuadernos, lápices, bolígrafos y sobres" },
  { nombre: "Tabaco y Cigarrillos", descripcion: "Cigarrillos, tabaco y cigarros puros" },
  { nombre: "Primeros Auxilios", descripcion: "Curitas, algodón, alcohol y gasas" },
  { nombre: "Recargas y Servicios", descripcion: "Recargas telefónicas, tarjetas y otros servicios" },
  { nombre: "Otros", descripcion: "Productos de temporada que no encajan en otra categoría" },
]);
