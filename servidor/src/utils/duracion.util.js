const MULTIPLICADORES = { s: 1, m: 60, h: 3600, d: 86400 };

/**
 * Convierte una duración de jsonwebtoken ("1h", "30m", "7d") a segundos.
 * @param {string} duracion
 * @returns {number}
 */
export const duracionASegundos = (duracion) => {
  if (typeof duracion !== "string") return 0;
  const coincidencia = /^(\d+)\s*(s|m|h|d)$/.exec(duracion.trim());
  if (!coincidencia) return 0;
  const [, cantidad, unidad] = coincidencia;
  return Number(cantidad) * MULTIPLICADORES[unidad];
};
