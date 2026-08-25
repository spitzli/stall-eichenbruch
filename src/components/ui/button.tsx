'use client'

import { cn } from '@/utilities/ui'
import { Slot } from '@radix-ui/react-slot'
import { type VariantProps, cva } from 'class-variance-authority'
import * as React from 'react'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-foreground',
        outline: 'border border-foreground/25 bg-transparent hover:border-foreground hover:bg-card',
        ghost: 'hover:bg-secondary',
        link: 'underline underline-offset-4 decoration-hay decoration-2 hover:decoration-primary',
        destructive: 'bg-destructive text-white hover:bg-destructive/90',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-border',
      },
      size: {
        clear: '',
        default: 'h-11 px-5 text-[15px]',
        sm: 'h-9 px-4 text-sm',
        lg: 'h-12 px-6 text-base',
        icon: 'size-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export interface ButtonProps
  extends React.ComponentProps<'button'>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button: React.FC<ButtonProps> = ({ asChild = false, className, size, variant, ...props }) => {
  const Comp = asChild ? Slot : 'button'

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
