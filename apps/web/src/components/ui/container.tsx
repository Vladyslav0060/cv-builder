import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const containerVariants = cva(
  "mx-auto flex min-h-full w-full min-w-0 flex-col data-[centered=true]:items-center",
  {
    variants: {
      variant: {
        fullMobileConstrainedPadded: "max-w-7xl px-0 sm:px-6 lg:px-8",
        constrainedPadded: "max-w-7xl px-4 sm:px-6 lg:px-8",
        fullMobileConstrainedBreakpointPadded:
          "max-w-screen-xl px-0 sm:px-6 lg:px-8",
        constrainedBreakpointPadded:
          "max-w-screen-xl px-4 sm:px-6 lg:px-8",
        narrowConstrainedPadded: "max-w-3xl px-4 sm:px-6 lg:px-8",
      },
      paddingY: {
        none: "py-0",
        top: "pt-14",
        sm: "py-4",
        md: "py-6",
        lg: "py-8",
        xl: "py-14",
      },
      centered: {
        true: "items-center",
        false: "items-stretch",
      },
    },
    defaultVariants: {
      variant: "narrowConstrainedPadded",
      paddingY: "top",
      centered: false,
    },
  },
)

export interface ContainerProps
  extends React.ComponentProps<"div">,
    VariantProps<typeof containerVariants> {
  asChild?: boolean
}

const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  (
    {
      className,
      children,
      variant,
      paddingY,
      centered,
      asChild = false,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot.Root : "div"

    return (
      <Comp
        ref={ref}
        data-slot="container"
        data-variant={variant}
        data-padding-y={paddingY}
        data-centered={centered ?? false}
        className={cn(
          containerVariants({ variant, paddingY, centered }),
          className,
        )}
        {...props}
      >
        {children}
      </Comp>
    )
  },
)

Container.displayName = "Container"

export { Container, containerVariants }
