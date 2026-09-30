"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  restablecerContrasenaSchema,
  type FormularioRestablecer,
} from "@/lib/validations/auth.schema";
import { useRestablecerContrasena, useValidarTokenRecuperacion } from "@/lib/queries/auth.queries";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

/** CU-03: establece la nueva contraseña a partir del enlace recibido. */
export function RestablecerContrasenaForm() {
  const parametros = useSearchParams();
  const token = parametros.get("token") ?? "";
  const validacion = useValidarTokenRecuperacion(token);
  const restablecer = useRestablecerContrasena();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormularioRestablecer>({
    resolver: zodResolver(restablecerContrasenaSchema),
    defaultValues: { password: "", confirmacion: "" },
  });

  if (!token) return <TokenInvalido />;

  if (validacion.isPending) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Restablecer contraseña</CardTitle>
          <CardDescription>Verificando el enlace recibido...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (validacion.isError) return <TokenInvalido />;

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Crear nueva contraseña</CardTitle>
        <CardDescription>El enlace es válido para {validacion.data?.email}.</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={handleSubmit((datos) => restablecer.mutate({ token, password: datos.password }))}
          className="flex flex-col gap-4"
          noValidate
        >
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
              aria-invalid={Boolean(errors.confirmacion)}
              {...register("confirmacion")}
            />
            {errors.confirmacion && (
              <p className="text-sm text-destructive">{errors.confirmacion.message}</p>
            )}
          </div>

          <Button type="submit" disabled={isSubmitting || restablecer.isPending}>
            {restablecer.isPending ? "Guardando..." : "Guardar contraseña"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function TokenInvalido() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Enlace inválido o caducado</CardTitle>
        <CardDescription>
          El enlace de recuperación ya no está vigente. Solicita uno nuevo para continuar.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Link
          href="/recuperar-contrasena"
          className="text-sm font-medium text-primary hover:underline"
        >
          Solicitar un nuevo enlace
        </Link>
      </CardContent>
    </Card>
  );
}
