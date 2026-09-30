"use client";

import Link from "next/link";
import { ProductoForm } from "@/components/productos/producto-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useProducto } from "@/lib/queries/producto.queries";

type Props = {
  id: number;
};

/** CU-08: carga el producto y monta el formulario en modo edición. */
export function ProductoEnEdicion({ id }: Props) {
  const producto = useProducto(id);

  if (producto.isPending) {
    return (
      <div className="space-y-4" aria-busy="true" aria-label="Cargando producto">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (producto.isError || !producto.data) {
    return (
      <Card className="border-destructive/40">
        <CardHeader>
          <CardTitle className="text-destructive">No encontramos el producto</CardTitle>
          <CardDescription>
            Es posible que el producto ya haya sido eliminado del catálogo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/productos" className="text-sm font-medium text-primary hover:underline">
            Volver al listado de productos
          </Link>
        </CardContent>
      </Card>
    );
  }

  return <ProductoForm producto={producto.data} />;
}
