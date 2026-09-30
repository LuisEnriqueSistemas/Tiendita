import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";
import { cn } from "@/lib/utils/cn";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary/10 text-primary",
        outline: "border-border text-muted-foreground",
        destructive: "border-transparent bg-destructive/10 text-destructive",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

type Props = React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>;

export function Badge({ className, variant, ...props }: Props) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { badgeVariants };
