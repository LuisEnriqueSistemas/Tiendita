"use client";

import { PackageSearch } from "lucide-react";
import { FiltrosProductos } from "@/components/productos/filtros-productos";
import { PaginacionProductos } from "@/components/productos/paginacion-productos";
import { ProductoCard } from "@/components/productos/producto-card";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useProductos } from "@/lib/queries/producto.queries";

type Props = {
  /** Muestra los botones de editar y eliminar. */
  conAcciones?: boolean;
  /** Oculta los filtros cuando la página ya los incluye en otro lugar. */
  conFiltros?: boolean;
};

/** CU-05: cuadrícula de cards del catálogo con búsqueda y filtro por categoría. */
export function ListadoProductos({ conAcciones = false, conFiltros = true }: Props) {
  const productos = useProductos();

  if (productos.isError) {
    return (
      <Card className="border-destructive/40">
        <CardContent className="py-8 text-center text-sm text-destructive">
          No pudimos cargar los productos. Verifica que el servidor esté ejecutándose.
        </CardContent>
      </Card>
    );
  }

  if (productos.isPending) return <EsqueletoProductos />;

  const { productos: items, paginacion } = productos.data;

  return (
    <section className="flex flex-col gap-6">
      {conFiltros ? <FiltrosProductos /> : null}

      {items.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <PackageSearch className="h-10 w-10 text-muted-foreground" aria-hidden />
            <div>
              <p className="font-medium">No hay productos que coincidan</p>
              <p className="text-sm text-muted-foreground">
                Ajusta la búsqueda o cambia el filtro de categoría.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((producto) => (
            <li key={producto.id}>
              <ProductoCard producto={producto} mostrarAcciones={conAcciones} />
            </li>
          ))}
        </ul>
      )}

      <PaginacionProductos paginacion={paginacion} />
    </section>
  );
}

function EsqueletoProductos() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true" aria-label="Cargando productos">
      <Skeleton className="h-10 w-full" />
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }, (_, indice) => (
          <li key={indice}>
            <Card className="overflow-hidden">
              <Skeleton className="aspect-[4/3] w-full rounded-none" />
              <CardContent className="space-y-2 py-4">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
}
