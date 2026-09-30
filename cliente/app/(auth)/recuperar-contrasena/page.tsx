import { RecuperarContrasenaForm } from "@/components/auth/recuperar-contrasena-form";

export const metadata = { title: "Recuperar contraseña | Tienda" };

export default function RecuperarContrasenaPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <RecuperarContrasenaForm />
    </main>
  );
}
