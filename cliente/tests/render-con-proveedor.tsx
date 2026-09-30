"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, type RenderOptions, type RenderResult } from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";

/** Crea un QueryClient aislado por prueba. */
export const crearQueryClientDePruebas = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });

/** Envolve el componente con los proveedores que exige la aplicación. */
export function ProvidersDePruebas({ children }: { children: ReactNode }) {
  const queryClient = crearQueryClientDePruebas();
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

type Opciones = RenderOptions & {
  /** Permite sembrar la caché antes del render y observar el refetch. */
  queryClient?: QueryClient;
};

/** Renderiza con los proveedores de la aplicación y `localStorage` limpio. */
export function renderConProveedores(ui: ReactElement, opciones?: Opciones): RenderResult {
  window.localStorage.clear();
  const { queryClient, ...renderOpciones } = opciones ?? {};
  const cliente = queryClient ?? crearQueryClientDePruebas();
  // El cliente se crea una sola vez por render para no perder la caché al re-renderizar.
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={cliente}>{children}</QueryClientProvider>
  );
  return render(ui, { wrapper, ...renderOpciones });
}
