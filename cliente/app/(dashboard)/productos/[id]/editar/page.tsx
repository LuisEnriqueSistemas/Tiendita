import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { ProductoEnEdicion } from "@/components/productos/producto-en-edicion";

export const metadata = { title: "Editar producto | Tienda" };

export default async function EditarProductoPage({ params }: PageProps<"/productos/[id]/editar">) {
  const { id } = await params;

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <header>
        <Link
          href="/productos"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="mr-1 h-4 w-4" aria-hidden />
          Volver a productos
        </Link>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Editar producto</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Modifica la información del producto y guarda los cambios.
        </p>
      </header>

      <ProductoEnEdicion id={Number(id)} />
    </div>
  );
}
