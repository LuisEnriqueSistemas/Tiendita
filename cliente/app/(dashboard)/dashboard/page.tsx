import Link from "next/link";
import { Plus } from "lucide-react";
import { KpisProductos } from "@/components/productos/kpis-productos";
import { ListadoProductos } from "@/components/productos/listado-productos";
import { Button } from "@/components/ui/button";
import { ResumenSesion } from "@/components/dashboard/resumen-sesion";

export const metadata = { title: "Dashboard | Tienda" };

export default function DashboardPage() {
  return (
    <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-8">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Consulta tu catálogo por nombre o categoría y gestiona los productos de la tienda.
          </p>
        </div>
        <Button asChild>
          <Link href="/productos/nuevo">
            <Plus className="mr-2 h-4 w-4" aria-hidden />
            Nuevo producto
          </Link>
        </Button>
      </header>

      <KpisProductos />

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold tracking-tight">Productos del catálogo</h2>
        <ListadoProductos />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold tracking-tight">Mi sesión</h2>
        <ResumenSesion />
      </section>
    </div>
  );
}
