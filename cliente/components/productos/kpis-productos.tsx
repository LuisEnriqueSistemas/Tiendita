"use client";

import Link from "next/link";
import { Boxes, Package, Wallet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useResumenProductos } from "@/lib/queries/producto.queries";
import { formatearMoneda } from "@/lib/utils/formato";

/** CU-09: indicadores del catálogo mostrados en el dashboard. */
export function KpisProductos() {
  const { data, isPending, isError } = useResumenProductos();

  if (isError) {
    return (
      <p className="rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
        No pudimos cargar los indicadores del catálogo.
      </p>
    );
  }

  const indicadores = [
    {
      titulo: "Productos activos",
      valor: data ? String(data.totalProductos) : null,
      icono: Package,
      enlace: "/productos",
    },
    {
      titulo: "Categorías",
      valor: data ? String(data.totalCategorias) : null,
      icono: Boxes,
      enlace: "/categorias",
    },
    {
      titulo: "Valor del inventario",
      valor: data ? formatearMoneda(data.valorInventario) : null,
      icono: Wallet,
      enlace: "/productos",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {indicadores.map(({ titulo, valor, icono: Icono, enlace }) => (
        <Link key={titulo} href={enlace} className="group">
          <Card className="h-full transition-colors group-hover:border-primary/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{titulo}</CardTitle>
              <Icono className="h-4 w-4 text-primary" aria-hidden />
            </CardHeader>
            <CardContent>
              {isPending || valor === null ? (
                <Skeleton className="h-8 w-28" />
              ) : (
                <p className="text-2xl font-bold tracking-tight">{valor}</p>
              )}
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
