import { Suspense } from "react";
import { RestablecerContrasenaForm } from "@/components/auth/restablecer-contrasena-form";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = { title: "Restablecer contraseña | Tienda" };

export default function RestablecerContrasenaPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <Suspense
        fallback={
          <div className="w-full max-w-md">
            <Skeleton className="h-64 w-full" />
          </div>
        }
      >
        <RestablecerContrasenaForm />
      </Suspense>
    </main>
  );
}
