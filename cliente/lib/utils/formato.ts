/** Formatea un importe con el padrão regional de la tienda. */
export const formatearMoneda = (valor: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 2,
  }).format(valor ?? 0);

/** Formatea una fecha ISO en formato largo local. */
export const formatearFecha = (valor?: string | null) =>
  valor ? new Date(valor).toLocaleDateString("es", { dateStyle: "long" }) : "—";
