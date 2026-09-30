"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuthStore } from "@/lib/stores/auth.store";
import { Skeleton } from "@/components/ui/skeleton";

/** Envía al panel si hay sesión y al login si no la hay. */
export function RedirigirSegunSesion() {
  const router = useRouter();
  const token = useAuthStore((estado) => estado.token);
  const hidratado = useAuthStore((estado) => estado.hidratado);

  useEffect(() => {
    if (!hidratado) return;
    router.replace(token ? "/dashboard" : "/login");
  }, [hidratado, token, router]);

  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-sm space-y-3">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </main>
  );
}
