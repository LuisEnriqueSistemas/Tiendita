/**
 * Doble de prueba para el objeto `res` de Express.
 */
export const crearResFalso = () => {
  const res = { statusCode: 200, cuerpo: undefined };
  res.status = (codigo) => {
    res.statusCode = codigo;
    return res;
  };
  res.json = (cuerpo) => {
    res.cuerpo = cuerpo;
    return res;
  };
  return res;
};
