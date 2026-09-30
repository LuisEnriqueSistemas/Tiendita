"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import * as usuarioService from "@/lib/services/usuario.service";
import { useAuthStore } from "@/lib/stores/auth.store";
import type { DtoActualizarPerfil } from "@/lib/types/cuentas";

/** CU-04: datos del usuario autenticado. */
export const useMiPerfil = () => {
  const token = useAuthStore((estado) => estado.token);

  return useQuery({
    queryKey: ["usuarios", "mi-perfil"],
    queryFn: () => usuarioService.obtenerPerfil(token as string),
    enabled: Boolean(token),
    staleTime: 60_000,
  });
};

/** CU-04: actualiza nombre, correo o contraseña. */
export const useActualizarPerfil = () => {
  const queryClient = useQueryClient();
  const actualizarUsuario = useAuthStore((estado) => estado.actualizarUsuario);

  return useMutation({
    mutationFn: (dto: DtoActualizarPerfil) => {
      const { token } = useAuthStore.getState();
      return usuarioService.actualizarPerfil(token as string, dto);
    },
    onSuccess: (usuario) => {
      actualizarUsuario({ ...usuario });
      queryClient.setQueryData(["usuarios", "mi-perfil"], usuario);
      toast.success("Tus datos fueron actualizados correctamente");
    },
    onError: (error: Error) => toast.error(error.message),
  });
};

/** CU-04: da de baja la cuenta y cierra la sesión. */
export const useEliminarCuenta = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const cerrarSesion = useAuthStore((estado) => estado.cerrarSesion);

  return useMutation({
    mutationFn: () => {
      const { token } = useAuthStore.getState();
      return usuarioService.eliminarCuenta(token as string);
    },
    onSuccess: (respuesta) => {
      queryClient.clear();
      cerrarSesion();
      toast.success(respuesta.mensaje);
      router.push("/");
    },
    onError: (error: Error) => toast.error(error.message),
  });
};
