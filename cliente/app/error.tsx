"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ErrorGlobal({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Ocurrió un error inesperado</CardTitle>
          <CardDescription>No pudimos completar la operación. Vuelve a intentarlo.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={reset}>Reintentar</Button>
        </CardContent>
      </Card>
    </main>
  );
}
