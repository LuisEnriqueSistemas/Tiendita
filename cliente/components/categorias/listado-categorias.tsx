"use client";

import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useCategorias } from "@/lib/queries/categoria.queries";

/** CU-01: listado de solo lectura del catálogo de categorías. */
export function ListadoCategorias() {
  const categorias = useCategorias();

  if (categorias.isPending) {
    return (
      <ul className="grid gap-3 sm:grid-cols-2" aria-busy="true" aria-label="Cargando categorías">
        {Array.from({ length: 6 }, (_, indice) => (
          <li key={indice}>
            <Skeleton className="h-16 w-full" />
          </li>
        ))}
      </ul>
    );
  }

  if (categorias.isError) {
    return (
      <p className="rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
        No pudimos cargar las categorías. Verifica que el servidor esté ejecutándose.
      </p>
    );
  }

  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {categorias.data.categorias.map((categoria) => (
        <li key={categoria.id} className="rounded-lg border border-border p-4">
          <div className="flex items-center justify-between gap-2">
            <p className="font-medium">{categoria.nombre}</p>
            <Badge variant="outline">#{categoria.id}</Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {categoria.descripcion ?? "Sin descripción"}
          </p>
        </li>
      ))}
    </ul>
  );
}
