import type { DetalleError, RespuestaError } from "@/lib/types/cuentas";

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

/** Error normalizado de la API, con el contrato de error del backend. */
export class ApiError extends Error {
  readonly status: number;
  readonly codigo: string;
  readonly detalles: DetalleError[];

  constructor(status: number, codigo: string, mensaje: string, detalles: DetalleError[] = []) {
    super(mensaje);
    this.name = "ApiError";
    this.status = status;
    this.codigo = codigo;
    this.detalles = detalles;
  }

  /** Mensaje asociado a un campo del formulario, si el backend lo informa. */
  mensajeDeCampo(campo: string): string | undefined {
    return this.detalles.find((detalle) => detalle.campo === campo)?.mensaje;
  }
}

type OpcionesPeticion = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  token?: string | null;
  signal?: AbortSignal;
};

const construirError = (status: number, cuerpo: unknown): ApiError => {
  const error = (cuerpo as Partial<RespuestaError> | null)?.error;
  return new ApiError(
    status,
    error?.codigo ?? "ERROR_DESCONOCIDO",
    error?.mensaje ?? "No fue posible completar la operación",
    error?.detalles ?? [],
  );
};

/** `FormData` debe viajar sin `Content-Type`: el navegador añade el boundary. */
const serializarCuerpo = (body: unknown): BodyInit | undefined => {
  if (body === undefined) return undefined;
  if (body instanceof FormData) return body;
  return JSON.stringify(body);
};

/**
 * Cliente HTTP único del frontend: adjunta el token de sesión y
 * normaliza los errores del backend.
 */
export async function apiRequest<T>(ruta: string, opciones: OpcionesPeticion = {}): Promise<T> {
  const { method = "GET", body, token, signal } = opciones;

  const encabezados: Record<string, string> = { Accept: "application/json" };
  if (body !== undefined && !(body instanceof FormData)) {
    encabezados["Content-Type"] = "application/json";
  }
  if (token) encabezados.Authorization = `Bearer ${token}`;

  let respuesta: Response;
  try {
    respuesta = await fetch(`${API_URL}${ruta}`, {
      method,
      headers: encabezados,
      body: serializarCuerpo(body),
      signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    throw new ApiError(
      0,
      "SIN_CONEXION",
      "No pudimos conectar con el servidor. Intenta nuevamente.",
    );
  }

  const texto = await respuesta.text();
  const cuerpo = texto ? JSON.parse(texto) : null;

  if (!respuesta.ok) throw construirError(respuesta.status, cuerpo);

  return cuerpo as T;
}

/** Serializa los filtros del catálogo como query string, omitiendo vacíos. */
export const construirQuery = (parametros: Record<string, string | number | null | undefined>) => {
  const query = new URLSearchParams();
  for (const [clave, valor] of Object.entries(parametros)) {
    if (valor === null || valor === undefined || valor === "") continue;
    query.set(clave, String(valor));
  }
  const texto = query.toString();
  return texto ? `?${texto}` : "";
};
