"use client";

import { useAuthStore } from "@/lib/stores/auth.store";
import { useMiPerfil } from "@/lib/queries/usuario.queries";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/** Resumen de la sesión actual tras iniciar sesión. */
export function ResumenSesion() {
  const usuarioEnStore = useAuthStore((estado) => estado.usuario);
  const perfil = useMiPerfil();
  const usuario = perfil.data ?? usuarioEnStore;

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Hola{usuario ? `, ${usuario.nombre}` : ""}</CardTitle>
          <CardDescription>Esta es tu sesión activa en la tienda.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {perfil.isPending ? (
            <>
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-4 w-64" />
            </>
          ) : (
            <>
              <p>
                <span className="text-muted-foreground">Correo: </span>
                {usuario?.email}
              </p>
              <p>
                <span className="text-muted-foreground">Cuenta creada: </span>
                {perfil.data?.creadoEn
                  ? new Date(perfil.data.creadoEn).toLocaleDateString("es")
                  : "—"}
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
