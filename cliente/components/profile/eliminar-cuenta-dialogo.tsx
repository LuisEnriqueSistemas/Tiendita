"use client";

import { useState } from "react";
import { TriangleAlert } from "lucide-react";
import { useEliminarCuenta } from "@/lib/queries/usuario.queries";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

/** CU-04: baja de la cuenta con confirmación explícita. */
export function EliminarCuentaDialogo() {
  const [abierto, setAbierto] = useState(false);
  const eliminar = useEliminarCuenta();

  return (
    <Card className="border-destructive/40">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <TriangleAlert className="h-5 w-5" aria-hidden />
          Zona de riesgo
        </CardTitle>
        <CardDescription>
          La eliminación de la cuenta es permanente: perderás el acceso y no podrás recuperar tu
          información.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <AlertDialog open={abierto} onOpenChange={setAbierto}>
          <AlertDialogTrigger asChild>
            <Button variant="destructive">Eliminar cuenta</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Confirmas la eliminación de tu cuenta?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer. Se cerrará tu sesión de forma permanente.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel asChild>
                <Button variant="outline">Cancelar</Button>
              </AlertDialogCancel>
              <AlertDialogDestructiveAction
                onClick={() => eliminar.mutate()}
                disabled={eliminar.isPending}
              >
                {eliminar.isPending ? "Eliminando..." : "Sí, eliminar mi cuenta"}
              </AlertDialogDestructiveAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
