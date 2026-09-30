"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { SelectorImagen } from "@/components/productos/selector-imagen";
import { useCategorias } from "@/lib/queries/categoria.queries";
import { useActualizarProducto, useCrearProducto } from "@/lib/queries/producto.queries";
import type { DtoProducto, Producto } from "@/lib/types/productos";
import {
  productoSchema,
  type DatosProducto,
  type FormularioProducto,
} from "@/lib/validations/producto.schema";

const SIN_CATEGORIA = "sin-categoria";

const CAMPOS_VACIOS: FormularioProducto = {
  nombre: "",
  descripcion: "",
  categoriaId: undefined,
  precioProveedor: "",
  precioVenta: "",
  imagen: undefined,
};

type Props = {
  /** Si se informa, el formulario funciona en modo edición. */
  producto?: Producto;
};

/** CU-07 y CU-08: alta y edición de un producto del catálogo. */
export function ProductoForm({ producto }: Props) {
  const router = useRouter();
  const categorias = useCategorias();
  const crear = useCrearProducto();
  const actualizar = useActualizarProducto();

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormularioProducto, unknown, DatosProducto>({
    resolver: zodResolver(productoSchema),
    defaultValues: CAMPOS_VACIOS,
    values: producto
      ? {
          nombre: producto.nombre,
          descripcion: producto.descripcion ?? "",
          categoriaId: producto.categoria?.id,
          precioProveedor: String(producto.precioProveedor),
          precioVenta: String(producto.precioVenta),
          imagen: undefined,
        }
      : undefined,
  });

  const guardando = isSubmitting || crear.isPending || actualizar.isPending;

  const alGuardar = () => {
    if (!producto) reset(CAMPOS_VACIOS);
    router.push("/productos");
  };

  const enviar = (datos: DatosProducto) => {
    const dto: DtoProducto = {
      nombre: datos.nombre,
      descripcion: datos.descripcion ?? "",
      categoriaId: datos.categoriaId,
      precioProveedor: datos.precioProveedor,
      precioVenta: datos.precioVenta,
      imagen: datos.imagen ?? null,
    };

    if (producto) {
      actualizar.mutate({ id: producto.id, dto }, { onSuccess: alGuardar });
      return;
    }
    crear.mutate(dto, { onSuccess: alGuardar });
  };

  if (categorias.isPending) {
    return (
      <div className="space-y-4" aria-busy="true" aria-label="Cargando formulario">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(enviar)} className="grid gap-6 lg:grid-cols-[320px_1fr]">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Imagen del producto</CardTitle>
          <CardDescription>Opcional. JPG, PNG o WebP de hasta 5 MB.</CardDescription>
        </CardHeader>
        <CardContent>
          <Controller
            control={control}
            name="imagen"
            render={({ field }) => (
              <SelectorImagen
                archivo={field.value ?? null}
                imagenActual={producto?.imagenUrl}
                disabled={guardando}
                error={errors.imagen?.message}
                onCambiar={field.onChange}
              />
            )}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Datos del producto</CardTitle>
          <CardDescription>
            Los precios admiten coma o punto como separador decimal.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre</Label>
            <Input
              id="nombre"
              placeholder="Gaseosa cola 2L"
              aria-invalid={Boolean(errors.nombre)}
              {...register("nombre")}
            />
            {errors.nombre ? (
              <p className="text-sm text-destructive">{errors.nombre.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción</Label>
            <Textarea
              id="descripcion"
              rows={3}
              placeholder="Descripción comercial del producto"
              aria-invalid={Boolean(errors.descripcion)}
              {...register("descripcion")}
            />
            {errors.descripcion ? (
              <p className="text-sm text-destructive">{errors.descripcion.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="categoriaId">Categoría</Label>
            <Controller
              control={control}
              name="categoriaId"
              render={({ field }) => (
                <Select
                  value={field.value ? String(field.value) : SIN_CATEGORIA}
                  onValueChange={(valor) =>
                    field.onChange(valor === SIN_CATEGORIA ? undefined : Number(valor))
                  }
                >
                  <SelectTrigger id="categoriaId" aria-invalid={Boolean(errors.categoriaId)}>
                    <SelectValue placeholder="Selecciona una categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {categorias.data?.categorias.map((categoria) => (
                      <SelectItem key={categoria.id} value={String(categoria.id)}>
                        {categoria.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.categoriaId ? (
              <p className="text-sm text-destructive">{errors.categoriaId.message}</p>
            ) : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="precioProveedor">Precio de proveedor</Label>
              <Input
                id="precioProveedor"
                inputMode="decimal"
                placeholder="1500,00"
                aria-invalid={Boolean(errors.precioProveedor)}
                {...register("precioProveedor")}
              />
              {errors.precioProveedor ? (
                <p className="text-sm text-destructive">{errors.precioProveedor.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="precioVenta">Precio de venta</Label>
              <Input
                id="precioVenta"
                inputMode="decimal"
                placeholder="3200,00"
                aria-invalid={Boolean(errors.precioVenta)}
                {...register("precioVenta")}
              />
              {errors.precioVenta ? (
                <p className="text-sm text-destructive">{errors.precioVenta.message}</p>
              ) : null}
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <Button type="submit" disabled={guardando}>
              {guardando
                ? "Guardando…"
                : producto
                  ? "Guardar cambios"
                  : "Registrar producto"}
            </Button>
            <Button type="button" variant="ghost" asChild>
              <Link href="/productos">Cancelar</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
