"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogDestructiveAction,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useEliminarProducto } from "@/lib/queries/producto.queries";
import type { Producto } from "@/lib/types/productos";

type Props = {
  producto: Producto;
};

/** CU-09: confirmación de la baja lógica de un producto. */
export function EliminarProductoDialogo({ producto }: Props) {
  const [abierto, setAbierto] = useState(false);
  const eliminar = useEliminarProducto();

  return (
    <AlertDialog open={abierto} onOpenChange={setAbierto}>
      <AlertDialogTrigger asChild>
        <Button size="sm" variant="destructive" aria-label={`Eliminar ${producto.nombre}`}>
          <Trash2 className="h-4 w-4" aria-hidden />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar &quot;{producto.nombre}&quot;?</AlertDialogTitle>
          <AlertDialogDescription>
            El producto dejará de estar disponible en el catálogo y no aparecerá en el dashboard.
            Esta acción no se puede deshacer desde la interfaz.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button variant="outline">Cancelar</Button>
          </AlertDialogCancel>
          <AlertDialogDestructiveAction
            disabled={eliminar.isPending}
            onClick={() => eliminar.mutate(producto.id, { onSuccess: () => setAbierto(false) })}
          >
            {eliminar.isPending ? "Eliminando..." : "Sí, eliminar"}
          </AlertDialogDestructiveAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
