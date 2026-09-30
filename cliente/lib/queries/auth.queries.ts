"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import * as authService from "@/lib/services/auth.service";
import { useAuthStore } from "@/lib/stores/auth.store";
import type { ApiError } from "@/lib/api/client";

const mensajeDeError = (error: unknown) =>
  error instanceof Error ? error.message : "Ocurrió un error inesperado";

/** CU-02: inicia sesión, guarda la sesión y redirige al panel. */
export const useLogin = () => {
  const router = useRouter();
  const iniciarSesion = useAuthStore((estado) => estado.iniciarSesion);

  return useMutation({
    mutationFn: authService.iniciarSesion,
    onSuccess: (sesion) => {
      iniciarSesion(sesion.access_token, sesion.user);
      toast.success(`Bienvenido, ${sesion.user.nombre}`);
      router.push("/dashboard");
    },
    onError: (error: ApiError) => toast.error(error.message),
  });
};

/** CU-01: registra la cuenta y vuelve al inicio de sesión. */
export const useRegistro = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: authService.registrar,
    onSuccess: () => {
      toast.success("Cuenta registrada correctamente");
      router.push("/login");
    },
    onError: (error: ApiError) => toast.error(error.message),
  });
};

/** CU-03: solicita el enlace de recuperación. */
export const useSolicitarRecuperacion = () =>
  useMutation({
    mutationFn: authService.solicitarRecuperacion,
    onSuccess: (respuesta) => toast.success(respuesta.mensaje),
    onError: (error: ApiError) => toast.error(mensajeDeError(error)),
  });

/** CU-03: verifica la vigencia del enlace recibido por correo. */
export const useValidarTokenRecuperacion = (token: string) =>
  useQuery({
    queryKey: ["auth", "token-recuperacion", token],
    queryFn: () => authService.validarTokenRecuperacion(token),
    enabled: Boolean(token),
    retry: false,
    staleTime: 0,
  });

/** CU-03: establece la nueva contraseña. */
export const useRestablecerContrasena = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: authService.restablecerContrasena,
    onSuccess: (respuesta) => {
      toast.success(respuesta.mensaje);
      router.push("/login");
    },
    onError: (error: ApiError) => toast.error(mensajeDeError(error)),
  });
};
