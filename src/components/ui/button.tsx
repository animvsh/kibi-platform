
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-300 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-kibi-500 text-white hover:bg-kibi-600 active:bg-kibi-700 border-4 border-kibi-600 shadow-[0_8px_0_rgba(0,0,0,0.3)] hover:shadow-[0_10px_0_rgba(0,0,0,0.3)] hover:-translate-y-1 active:shadow-[0_4px_0_rgba(0,0,0,0.3)] active:translate-y-1 scale-100 hover:scale-105 active:scale-95 hover:rotate-1 active:rotate-0 hover-wobble",
        outline: "bg-dark-400 text-gray-200 hover:bg-dark-300 hover:text-white active:bg-dark-200 border-4 border-dark-300 shadow-[0_8px_0_rgba(0,0,0,0.3)] hover:shadow-[0_10px_0_rgba(0,0,0,0.3)] hover:-translate-y-1 active:shadow-[0_4px_0_rgba(0,0,0,0.3)] active:translate-y-1 scale-100 hover:scale-105 active:scale-95 hover:rotate-1 active:rotate-0 hover-bounce",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-[0_8px_0_rgba(0,0,0,0.3)] hover:shadow-[0_10px_0_rgba(0,0,0,0.3)] hover:-translate-y-1 active:shadow-[0_4px_0_rgba(0,0,0,0.3)] active:translate-y-1 scale-100 hover:scale-105 active:scale-95 hover:rotate-1 active:rotate-0 hover-pulsate",
        ghost: "text-gray-200 hover:bg-dark-300 hover:text-white shadow-[0_4px_0_rgba(0,0,0,0.1)] hover:shadow-[0_6px_0_rgba(0,0,0,0.1)] hover:-translate-y-1 active:translate-y-1 hover:scale-105 active:scale-95 hover:rotate-1 active:rotate-0 hover-pop",
        link: "text-primary underline-offset-4 hover:underline hover:scale-105 active:scale-95 shadow-[0_2px_0_rgba(0,0,0,0.05)] hover:shadow-[0_3px_0_rgba(0,0,0,0.05)] hover-pop",
        destructive: "bg-red-500 text-white hover:bg-red-600 active:bg-red-700 border-4 border-red-600 shadow-[0_8px_0_rgba(0,0,0,0.3)] hover:shadow-[0_10px_0_rgba(0,0,0,0.3)] hover:-translate-y-1 active:shadow-[0_4px_0_rgba(0,0,0,0.3)] active:translate-y-1 scale-100 hover:scale-105 active:scale-95 hover:rotate-1 active:rotate-0",
      },
      size: {
        default: "h-12 px-6 py-3",
        sm: "h-10 rounded-md px-4 py-2",
        lg: "h-14 rounded-md px-8 py-4",
        icon: "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
