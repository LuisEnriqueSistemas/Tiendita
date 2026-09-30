"use client";

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  actualizarPerfilSchema,
  type FormularioPerfil,
} from "@/lib/validations/usuario.schema";
import { useActualizarPerfil, useMiPerfil } from "@/lib/queries/usuario.queries";
import { useAuthStore } from "@/lib/stores/auth.store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { EliminarCuentaDialogo } from "@/components/profile/eliminar-cuenta-dialogo";

const CAMPOS_VACIOS = { nombre: "", email: "", password: "", confirmacion: "" };

/** CU-04: consulta y actualización de los datos del perfil. */
export function PerfilForm() {
  const perfil = useMiPerfil();
  const usuarioEnStore = useAuthStore((estado) => estado.usuario);
  const actualizar = useActualizarPerfil();
  const usuario = perfil.data ?? usuarioEnStore;

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<FormularioPerfil>({
    resolver: zodResolver(actualizarPerfilSchema),
    defaultValues: CAMPOS_VACIOS,
    // `values` mantiene el formulario sincronizado con los datos del servidor.
    values: usuario
      ? { nombre: usuario.nombre, email: usuario.email, password: "", confirmacion: "" }
      : undefined,
  });

  const nuevaPassword = useWatch({ control, name: "password" });
  const confirmacion = useWatch({ control, name: "confirmacion" });

  if (perfil.isPending && !usuario) return <EsqueletoPerfil />;

  if (perfil.isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No pudimos cargar tu perfil</CardTitle>
          <CardDescription>Intenta nuevamente en unos minutos.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const enviar = (datos: FormularioPerfil) => {
    const cambios: { nombre?: string; email?: string; password?: string } = {
      nombre: datos.nombre,
      email: datos.email,
    };
    if (datos.password) cambios.password = datos.password;
    actualizar.mutate(cambios, { onSuccess: () => reset(CAMPOS_VACIOS) });
  };

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Mis datos</CardTitle>
          <CardDescription>
            Actualiza tu nombre, correo o contraseña. Deja la contraseña vacía para conservarla.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(enviar)} className="flex flex-col gap-4" noValidate>
            <div className="flex flex-col gap-2">
              <Label htmlFor="nombre">Nombre completo</Label>
              <Input id="nombre" aria-invalid={Boolean(errors.nombre)} {...register("nombre")} />
              {errors.nombre && <p className="text-sm text-destructive">{errors.nombre.message}</p>}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                aria-invalid={Boolean(errors.email)}
                {...register("email")}
              />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Nueva contraseña</Label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                aria-invalid={Boolean(errors.password)}
                {...register("password")}
              />
              {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="confirmacion">Confirmar contraseña</Label>
              <Input
                id="confirmacion"
                type="password"
                autoComplete="new-password"
                aria-invalid={Boolean(confirmacion && confirmacion !== nuevaPassword)}
                {...register("confirmacion")}
              />
              {confirmacion && confirmacion !== nuevaPassword && (
                <p className="text-sm text-destructive">Las contraseñas no coinciden</p>
              )}
            </div>

            <Button type="submit" disabled={actualizar.isPending} className="w-fit">
              {actualizar.isPending ? "Guardando..." : "Guardar cambios"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <EliminarCuentaDialogo />
    </div>
  );
}

function EsqueletoPerfil() {
  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-72" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}
