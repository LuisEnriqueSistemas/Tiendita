"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registroSchema, type FormularioRegistro } from "@/lib/validations/auth.schema";
import { useRegistro } from "@/lib/queries/auth.queries";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/** CU-01: formulario de registro de cuenta. */
export function RegistroForm() {
  const registro = useRegistro();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormularioRegistro>({
    resolver: zodResolver(registroSchema),
    defaultValues: { nombre: "", email: "", password: "" },
  });

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Crear cuenta</CardTitle>
        <CardDescription>Regístrate para acceder a las áreas operativas de la tienda.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit((datos) => registro.mutate(datos))} className="flex flex-col gap-4" noValidate>
          <div className="flex flex-col gap-2">
            <Label htmlFor="nombre">Nombre completo</Label>
            <Input
              id="nombre"
              autoComplete="name"
              aria-invalid={Boolean(errors.nombre)}
              {...register("nombre")}
            />
            {errors.nombre && <p className="text-sm text-destructive">{errors.nombre.message}</p>}
          </div>

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

          <div className="flex flex-col gap-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              aria-invalid={Boolean(errors.password)}
              {...register("password")}
            />
            {errors.password ? (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            ) : (
              <p className="text-xs text-muted-foreground">Debe tener al menos 8 caracteres.</p>
            )}
          </div>

          <Button type="submit" disabled={isSubmitting || registro.isPending}>
            {registro.isPending ? "Registrando..." : "Registrarme"}
          </Button>

          <p className="text-sm text-muted-foreground">
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Inicia sesión
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
