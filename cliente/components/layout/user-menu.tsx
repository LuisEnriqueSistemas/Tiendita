"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { ChevronDown, LogOut, User } from "lucide-react";
import { useAuthStore } from "@/lib/stores/auth.store";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";

/** Menú del avatar: datos del usuario, perfil y cierre de sesión. */
export function UserMenu() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const usuario = useAuthStore((estado) => estado.usuario);
  const cerrarSesion = useAuthStore((estado) => estado.cerrarSesion);

  if (!usuario) return <Skeleton className="h-10 w-32" />;

  const iniciales = usuario.nombre
    .split(" ")
    .slice(0, 2)
    .map((parte) => parte.charAt(0).toUpperCase())
    .join("");

  const manejarCierre = () => {
    queryClient.clear();
    cerrarSesion();
    router.push("/login");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-10 gap-2" aria-label="Abrir menú de usuario">
          <span
            aria-hidden
            className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary"
          >
            {iniciales}
          </span>
          <span className="hidden text-sm font-medium sm:inline">{usuario.nombre}</span>
          <ChevronDown className="h-4 w-4" aria-hidden />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>{usuario.nombre}</DropdownMenuLabel>
        <p className="px-3 pb-2 text-xs text-muted-foreground">{usuario.email}</p>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/mi-perfil">
            <User className="h-4 w-4" aria-hidden />
            Mi perfil
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={manejarCierre}
          className="text-destructive focus:bg-destructive/10 focus:text-destructive"
        >
          <LogOut className="h-4 w-4" aria-hidden />
          Cerrar sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
