import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError, apiRequest } from "@/lib/api/client";

const crearRespuesta = (cuerpo: unknown, init: { ok?: boolean; status?: number } = {}) =>
  ({
    ok: init.ok ?? true,
    status: init.status ?? 200,
    text: async () => JSON.stringify(cuerpo),
  }) as Response;

/** Ejecuta la petición esperando el fallo y devuelve el ApiError producido. */
const errorDe = async (promesa: Promise<unknown>): Promise<ApiError> => {
  try {
    await promesa;
  } catch (fallo) {
    return fallo as ApiError;
  }
  throw new Error("Se esperaba que la petición fallara");
};

describe("apiRequest", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("devuelve el cuerpo de la respuesta en éxito", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(crearRespuesta({ mensaje: "ok" })));

    const resultado = await apiRequest<{ mensaje: string }>("/salud");

    expect(resultado).toEqual({ mensaje: "ok" });
  });

  it("envía el token como encabezado Authorization cuando se proporciona", async () => {
    const fetchMock = vi.fn().mockResolvedValue(crearRespuesta({}));
    vi.stubGlobal("fetch", fetchMock);

    await apiRequest("/usuarios/mi-perfil", { token: "abc123" });

    const [, opciones] = fetchMock.mock.calls[0];
    expect(opciones.headers.Authorization).toBe("Bearer abc123");
  });

  it("no envía Authorization cuando no hay token", async () => {
    const fetchMock = vi.fn().mockResolvedValue(crearRespuesta({}));
    vi.stubGlobal("fetch", fetchMock);

    await apiRequest("/salud");

    const [, opciones] = fetchMock.mock.calls[0];
    expect(opciones.headers.Authorization).toBeUndefined();
  });

  it("envía el cuerpo como JSON en las peticiones de escritura", async () => {
    const fetchMock = vi.fn().mockResolvedValue(crearRespuesta({}));
    vi.stubGlobal("fetch", fetchMock);

    await apiRequest("/auth/login", { method: "POST", body: { email: "ana@tienda.com" } });

    const [, opciones] = fetchMock.mock.calls[0];
    expect(opciones.method).toBe("POST");
    expect(opciones.headers["Content-Type"]).toBe("application/json");
    expect(JSON.parse(opciones.body)).toEqual({ email: "ana@tienda.com" });
  });

  it("convierte el error del backend en ApiError con sus detalles", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        crearRespuesta(
          {
            error: {
              codigo: "VALIDACION_FALLIDA",
              mensaje: "Los datos enviados no son válidos",
              detalles: [{ campo: "password", mensaje: "La contraseña es obligatoria" }],
            },
          },
          { ok: false, status: 400 },
        ),
      ),
    );

    const error = await errorDe(apiRequest("/auth/login"));

    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBe(400);
    expect(error.codigo).toBe("VALIDACION_FALLIDA");
    expect(error.mensajeDeCampo("password")).toBe("La contraseña es obligatoria");
    expect(error.mensajeDeCampo("email")).toBeUndefined();
  });

  it("usa un mensaje por defecto cuando la respuesta no tiene el contrato de error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(crearRespuesta({ mensaje: "algo" }, { ok: false, status: 500 })),
    );

    const error = await errorDe(apiRequest("/salud"));

    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBe(500);
    expect(error.message).toBe("No fue posible completar la operación");
  });

  it("informa cuando no hay conexión con el servidor", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("failed to fetch")));

    const error = await errorDe(apiRequest("/salud"));

    expect(error).toBeInstanceOf(ApiError);
    expect(error.codigo).toBe("SIN_CONEXION");
    expect(error.status).toBe(0);
  });
});
