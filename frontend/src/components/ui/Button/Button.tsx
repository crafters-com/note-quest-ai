// components/ui/Button/Button.tsx
import * as React from "react";
import { Slot } from "@radix-ui/react-slot"; // Muy recomendado para el patrón asChild
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../../utils/cn"; // Importamos nuestra nueva utilidad
import { buttonVariants } from "../../../utils/buttonUtils"; // Importamos las variantes de cva

// Extendemos las props para incluir las variantes de cva
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    // Si asChild es true, usamos Slot para pasar las props al hijo
    const Comp = asChild ? Slot : "button";
    
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button };