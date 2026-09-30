"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type FormularioLogin } from "@/lib/validations/auth.schema";
import { useLogin } from "@/lib/queries/auth.queries";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/** CU-02: formulario de inicio de sesión. */
export function LoginForm() {
  const login = useLogin();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormularioLogin>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Iniciar sesión</CardTitle>
        <CardDescription>Ingresa con tu correo y contraseña para entrar al panel.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit((datos) => login.mutate(datos))} className="flex flex-col gap-4" noValidate>
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
              autoComplete="current-password"
              aria-invalid={Boolean(errors.password)}
              {...register("password")}
            />
            {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
          </div>

          <Button type="submit" disabled={isSubmitting || login.isPending}>
            {login.isPending ? "Verificando..." : "Entrar"}
          </Button>

          <div className="flex flex-col gap-2 text-sm text-muted-foreground">
            <Link href="/recuperar-contrasena" className="text-primary hover:underline">
              ¿Olvidaste tu contraseña?
            </Link>
            <p>
              ¿Aún no tienes cuenta?{" "}
              <Link href="/registro" className="text-primary hover:underline">
                Regístrate
              </Link>
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
