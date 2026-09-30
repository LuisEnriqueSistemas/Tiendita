import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ListadoCategorias } from "@/components/categorias/listado-categorias";

export const metadata = { title: "Categorías | Tienda" };

export default function CategoriasPage() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Categorías</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Catálogo fijo de categorías disponibles para clasificar los productos de la tienda.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Categorías del catálogo</CardTitle>
          <CardDescription>
            Las categorías se cargan automáticamente en el servidor y no se editan desde la
            interfaz.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ListadoCategorias />
        </CardContent>
      </Card>
    </div>
  );
}
