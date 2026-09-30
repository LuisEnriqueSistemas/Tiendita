"use client";

import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCategorias } from "@/lib/queries/categoria.queries";
import { useFiltrosStore } from "@/lib/stores/filtros.store";
import { ETIQUETAS_ORDEN, ORDENES_PRODUCTO, type OrdenProducto } from "@/lib/types/productos";

const TODAS = "todas";

/** CU-05: búsqueda por nombre y filtro por categoría del catálogo. */
export function FiltrosProductos() {
  const nombre = useFiltrosStore((estado) => estado.nombre);
  const categoriaId = useFiltrosStore((estado) => estado.categoriaId);
  const orden = useFiltrosStore((estado) => estado.orden);
  const setNombre = useFiltrosStore((estado) => estado.setNombre);
  const setCategoriaId = useFiltrosStore((estado) => estado.setCategoriaId);
  const setOrden = useFiltrosStore((estado) => estado.setOrden);
  const setPagina = useFiltrosStore((estado) => estado.setPagina);
  const categorias = useCategorias();

  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center">
      <div className="relative flex-1">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          value={nombre}
          onChange={(evento) => setNombre(evento.target.value)}
          placeholder="Buscar producto por nombre"
          aria-label="Buscar producto por nombre"
          className="pl-9"
        />
      </div>

      <Select
        value={categoriaId === null ? TODAS : String(categoriaId)}
        onValueChange={(valor) =>
          setCategoriaId(valor === TODAS ? null : Number(valor))
        }
      >
        <SelectTrigger className="md:w-56" aria-label="Filtrar por categoría">
          <SelectValue placeholder="Todas las categorías" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={TODAS}>Todas las categorías</SelectItem>
          {categorias.data?.categorias.map((categoria) => (
            <SelectItem key={categoria.id} value={String(categoria.id)}>
              {categoria.nombre}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={orden} onValueChange={(valor) => setOrden(valor as OrdenProducto)}>
        <SelectTrigger className="md:w-64" aria-label="Ordenar productos">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {ORDENES_PRODUCTO.map((valor) => (
            <SelectItem key={valor} value={valor}>
              {ETIQUETAS_ORDEN[valor]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {nombre || categoriaId !== null ? (
        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            setNombre("");
            setCategoriaId(null);
            setPagina(1);
          }}
        >
          <X className="mr-2 h-4 w-4" aria-hidden />
          Limpiar
        </Button>
      ) : null}
    </div>
  );
}
