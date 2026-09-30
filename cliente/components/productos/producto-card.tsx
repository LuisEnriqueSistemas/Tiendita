"use client";

import Image from "next/image";
import Link from "next/link";
import { Pencil, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { EliminarProductoDialogo } from "@/components/productos/eliminar-producto-dialogo";
import type { Producto } from "@/lib/types/productos";
import { formatearMoneda } from "@/lib/utils/formato";

type Props = {
  producto: Producto;
  /** En el dashboard solo se consultan; la edición vive en /productos. */
  mostrarAcciones?: boolean;
};

/** CU-05: card con la información principal de un producto del catálogo. */
export function ProductoCard({ producto, mostrarAcciones = false }: Props) {
  const { id, nombre, descripcion, precioProveedor, precioVenta, margen, imagenUrl, categoria } = producto;

  return (
    <Card className="flex flex-col overflow-hidden">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
        {imagenUrl ? (
          <Image
            src={imagenUrl}
            alt={`Imagen de ${nombre}`}
            fill
            sizes="(max-width: 768px) 100vw, 300px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-muted-foreground">
            <Package className="h-10 w-10" aria-hidden />
            <span className="text-xs">Sin imagen</span>
          </div>
        )}
        {categoria ? (
          <Badge className="absolute left-2 top-2 bg-background/90" variant="outline">
            {categoria.nombre}
          </Badge>
        ) : null}
      </div>

      <CardHeader className="pb-2">
        <CardTitle className="line-clamp-2 text-base">{nombre}</CardTitle>
        {descripcion ? (
          <p className="line-clamp-2 text-sm text-muted-foreground">{descripcion}</p>
        ) : null}
      </CardHeader>

      <CardContent className="mt-auto space-y-1 text-sm">
        <p className="flex items-baseline justify-between">
          <span className="text-muted-foreground">Precio de venta</span>
          <span className="text-lg font-semibold">{formatearMoneda(precioVenta)}</span>
        </p>
        <p className="flex items-baseline justify-between">
          <span className="text-muted-foreground">Precio de proveedor</span>
          <span>{formatearMoneda(precioProveedor)}</span>
        </p>
        <p className="flex items-baseline justify-between">
          <span className="text-muted-foreground">Margen</span>
          <span className="font-medium text-primary">{formatearMoneda(margen)}</span>
        </p>
      </CardContent>

      {mostrarAcciones ? (
        <CardFooter className="gap-2">
          <Button asChild size="sm" variant="outline" className="flex-1">
            <Link href={`/productos/${id}/editar`}>
              <Pencil className="mr-2 h-4 w-4" aria-hidden />
              Editar
            </Link>
          </Button>
          <EliminarProductoDialogo producto={producto} />
        </CardFooter>
      ) : null}
    </Card>
  );
}
