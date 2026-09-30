"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFiltrosStore } from "@/lib/stores/filtros.store";
import type { Paginacion } from "@/lib/types/productos";

type Props = {
  paginacion: Paginacion;
};

/** CU-05: controles de paginación del listado de productos. */
export function PaginacionProductos({ paginacion }: Props) {
  const pagina = useFiltrosStore((estado) => estado.pagina);
  const setPagina = useFiltrosStore((estado) => estado.setPagina);
  const { total, totalPaginas } = paginacion;

  if (total === 0) return null;

  return (
    <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
      <p className="text-sm text-muted-foreground">
        Página {pagina} de {Math.max(totalPaginas, 1)} · {total} productos
      </p>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={pagina <= 1}
          onClick={() => setPagina(pagina - 1)}
        >
          <ChevronLeft className="mr-1 h-4 w-4" aria-hidden />
          Anterior
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={pagina >= totalPaginas}
          onClick={() => setPagina(pagina + 1)}
        >
          Siguiente
          <ChevronRight className="ml-1 h-4 w-4" aria-hidden />
        </Button>
      </div>
    </div>
  );
}
