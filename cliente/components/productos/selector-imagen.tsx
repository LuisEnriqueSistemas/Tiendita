"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { ImagePlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

type Props = {
  archivo: File | null;
  onCambiar: (archivo: File | null) => void;
  /** Imagen ya guardada, mostrada como vista previa al editar. */
  imagenActual?: string | null;
  error?: string;
  disabled?: boolean;
};

/** Selector de imagen del producto con vista previa local. */
export function SelectorImagen({ archivo, onCambiar, imagenActual, error, disabled }: Props) {
  const [vistaPrevia, setVistaPrevia] = useState<string | null>(null);

  // Libera la URL local anterior; no guarda estado, solo libera recursos.
  useEffect(() => {
    if (!vistaPrevia) return;
    return () => URL.revokeObjectURL(vistaPrevia);
  }, [vistaPrevia]);

  const seleccionar = (nuevo: File | null) => {
    setVistaPrevia(nuevo ? URL.createObjectURL(nuevo) : null);
    onCambiar(nuevo);
  };

  const fuente = vistaPrevia ?? imagenActual ?? null;

  return (
    <div className="space-y-2">
      <div
        className={cn(
          "relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-lg border border-dashed bg-muted",
          error && "border-destructive",
        )}
      >
        {fuente ? (
          <Image
            src={fuente}
            alt="Vista previa de la imagen del producto"
            fill
            unoptimized={fuente.startsWith("blob:")}
            sizes="320px"
            className="object-cover"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <ImagePlus className="h-8 w-8" aria-hidden />
            <span className="text-xs">JPG, PNG o WebP · máximo 5 MB</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button type="button" variant="outline" size="sm" disabled={disabled} asChild>
          <label className="cursor-pointer">
            {fuente ? "Reemplazar imagen" : "Seleccionar imagen"}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              disabled={disabled}
              onChange={(evento) => seleccionar(evento.target.files?.[0] ?? null)}
            />
          </label>
        </Button>
        {fuente ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={disabled}
            onClick={() => seleccionar(null)}
          >
            <X className="mr-2 h-4 w-4" aria-hidden />
            Quitar
          </Button>
        ) : null}
      </div>

      {archivo ? <p className="truncate text-xs text-muted-foreground">{archivo.name}</p> : null}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
