import { beforeEach, describe, expect, it } from "vitest";
import { FILTROS_INICIALES, useFiltrosStore } from "@/lib/stores/filtros.store";

describe("filtros.store", () => {
  beforeEach(() => useFiltrosStore.setState({ ...FILTROS_INICIALES }));

  it("arranca sin filtros aplicados", () => {
    expect(useFiltrosStore.getState()).toMatchObject({
      nombre: "",
      categoriaId: null,
      orden: "recientes",
      pagina: 1,
      limite: 12,
    });
  });

  it("vuelve a la primera página al cambiar el nombre", () => {
    useFiltrosStore.setState({ pagina: 4 });
    useFiltrosStore.getState().setNombre("gaseosa");

    expect(useFiltrosStore.getState()).toMatchObject({ nombre: "gaseosa", pagina: 1 });
  });

  it("vuelve a la primera página al cambiar la categoría", () => {
    useFiltrosStore.setState({ pagina: 3 });
    useFiltrosStore.getState().setCategoriaId(2);

    expect(useFiltrosStore.getState()).toMatchObject({ categoriaId: 2, pagina: 1 });
  });

  it("conserva la página al paginar hacia adelante", () => {
    useFiltrosStore.getState().setPagina(5);

    expect(useFiltrosStore.getState().pagina).toBe(5);
  });

  it("restablece los filtros al pedir la reinicialización", () => {
    useFiltrosStore.setState({ nombre: "gaseosa", categoriaId: 2, pagina: 3, orden: "nombre_asc" });

    useFiltrosStore.getState().reiniciar();

    expect(useFiltrosStore.getState()).toMatchObject(FILTROS_INICIALES);
  });
});
