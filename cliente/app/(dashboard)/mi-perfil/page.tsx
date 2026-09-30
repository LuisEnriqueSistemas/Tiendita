import { PerfilForm } from "@/components/profile/perfil-form";

export const metadata = { title: "Mi perfil | Tienda" };

export default function MiPerfilPage() {
  return (
    <div className="mx-auto w-full max-w-[1600px]">
      <header className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Mi perfil</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Consulta y actualiza la información de tu cuenta.
        </p>
      </header>
      <PerfilForm />
    </div>
  );
}
