"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useAuthStore } from "@/lib/stores/auth.store";
import { Skeleton } from "@/components/ui/skeleton";

type Props = {
  children: ReactNode;
  /** `true` en el área privada (exige sesión) y `false` en las pantallas de acceso. */
  requiereSesion: boolean;
};

/**
 * Controla el acceso a un grupo de rutas según el estado de la sesión.
 * Espera a que Zustand rehidrate el store para evitar decisiones con un token vacío.
 */
export function GuardarSesion({ children, requiereSesion }: Props) {
  const router = useRouter();
  const token = useAuthStore((estado) => estado.token);
  const hidratado = useAuthStore((estado) => estado.hidratado);

  useEffect(() => {
    if (!hidratado) return;
    if (requiereSesion && !token) router.replace("/login");
    if (!requiereSesion && token) router.replace("/dashboard");
  }, [hidratado, token, requiereSesion, router]);

  if (!hidratado || (requiereSesion ? !token : Boolean(token))) {
    return requiereSesion ? <EsqueletoAreaAutenticada /> : <EsqueletoFormulario />;
  }

  return <>{children}</>;
}

function EsqueletoAreaAutenticada() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="h-16 border-b border-border" />
      <div className="grid flex-1 grid-cols-1 md:grid-cols-[16rem_1fr]">
        <aside className="hidden border-r border-border p-4 md:block">
          <Skeleton className="h-10 w-full" />
        </aside>
        <main className="p-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="mt-4 h-40 w-full" />
        </main>
      </div>
    </div>
  );
}

function EsqueletoFormulario() {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md space-y-4">
        <Skeleton className="h-64 w-full" />
      </div>
    </main>
  );
}
