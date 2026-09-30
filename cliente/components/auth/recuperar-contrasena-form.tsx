"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  recuperarContrasenaSchema,
  type FormularioRecuperar,
} from "@/lib/validations/auth.schema";
import { useSolicitarRecuperacion } from "@/lib/queries/auth.queries";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/** CU-03: solicita el envío del enlace de recuperación. */
export function RecuperarContrasenaForm() {
  const solicitud = useSolicitarRecuperacion();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormularioRecuperar>({
    resolver: zodResolver(recuperarContrasenaSchema),
    defaultValues: { email: "" },
  });

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Recuperar contraseña</CardTitle>
        <CardDescription>
          Ingresa tu correo registrado y te enviaremos un enlace para crear una nueva contraseña.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={handleSubmit((datos) => solicitud.mutate(datos))}
          className="flex flex-col gap-4"
          noValidate
        >
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Correo electrónico</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              aria-invalid={Boolean(errors.email)}
              {...register("email")}
            />
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>

          <Button type="submit" disabled={isSubmitting || solicitud.isPending}>
            {solicitud.isPending ? "Enviando..." : "Enviar enlace"}
          </Button>

          <Link href="/login" className="text-sm text-primary hover:underline">
            Volver al inicio de sesión
          </Link>
        </form>
      </CardContent>
    </Card>
  );
}
