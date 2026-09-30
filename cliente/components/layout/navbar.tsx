"use client";

import { Store } from "lucide-react";
import { UserMenu } from "@/components/layout/user-menu";

/** Barra superior: marca de la tienda y menú de usuario. */
export function Navbar() {
  return (
    <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-border bg-background/80 px-6 backdrop-blur">
      <span className="flex items-center gap-2 text-lg font-semibold tracking-tight">
        <Store className="h-5 w-5 text-primary" aria-hidden />
        Tienda
      </span>
      <UserMenu />
    </header>
  );
}
