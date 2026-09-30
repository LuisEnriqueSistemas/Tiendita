"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Boxes, LayoutDashboard, Package, User } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const ENLACES = [
  { href: "/dashboard", etiqueta: "Dashboard", icono: LayoutDashboard },
  { href: "/productos", etiqueta: "Productos", icono: Package },
  { href: "/categorias", etiqueta: "Categorías", icono: Boxes },
  { href: "/mi-perfil", etiqueta: "Mi perfil", icono: User },
] as const;

/** Navegación del área autenticada, resaltando la sección activa. */
export function NavLateral() {
  const pathname = usePathname();

  return (
    <nav aria-label="Navegación principal" className="flex w-56 flex-col gap-1">
      {ENLACES.map(({ href, etiqueta, icono: Icono }) => {
        const activo = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            aria-current={activo ? "page" : undefined}
            className={cn(
              "flex items-center gap-2 rounded-lg border-l-2 px-3 py-2 text-sm font-medium transition-colors",
              activo
                ? "border-primary bg-primary/10 text-primary"
                : "border-transparent text-muted-foreground hover:bg-accent hover:text-foreground",
            )}
          >
            <Icono className="h-4 w-4" aria-hidden />
            {etiqueta}
          </Link>
        );
      })}
    </nav>
  );
}
