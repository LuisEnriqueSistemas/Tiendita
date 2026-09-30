import Link from "next/link";
import { Plus } from "lucide-react";
import { ListadoProductos } from "@/components/productos/listado-productos";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Productos | Tienda" };

export default function ProductosPage() {
  return (
    <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Productos</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Registra, edita y da de baja los productos del catálogo.
          </p>
        </div>
        <Button asChild>
          <Link href="/productos/nuevo">
            <Plus className="mr-2 h-4 w-4" aria-hidden />
            Nuevo producto
          </Link>
        </Button>
      </header>

      <ListadoProductos conAcciones />
    </div>
  );
}
