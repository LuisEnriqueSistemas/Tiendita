import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { ProductoForm } from "@/components/productos/producto-form";

export const metadata = { title: "Nuevo producto | Tienda" };

export default function NuevoProductoPage() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <header>
        <ButtonEnlaceVolver />
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Nuevo producto</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Completa los datos del producto para agregarlo al catálogo.
        </p>
      </header>

      <ProductoForm />
    </div>
  );
}

function ButtonEnlaceVolver() {
  return (
    <Link
      href="/productos"
      className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
    >
      <ChevronLeft className="mr-1 h-4 w-4" aria-hidden />
      Volver a productos
    </Link>
  );
}
