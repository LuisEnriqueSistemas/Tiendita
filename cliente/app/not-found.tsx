import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-3xl font-bold tracking-tight">Página no encontrada</h1>
      <p className="text-sm text-muted-foreground">La página que buscas no existe o fue movida.</p>
      <Link href="/login" className="text-sm font-medium text-primary hover:underline">
        Volver al inicio de sesión
      </Link>
    </main>
  );
}
