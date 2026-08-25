import { cn } from '@/utilities/ui'
import * as React from 'react'

const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({
  className,
  type,
  ...props
}) => {
  return (
    <input
      data-slot="input"
      className={cn(
        'flex h-12 w-full min-w-0 rounded-xl border border-input bg-background px-4 text-base placeholder:text-muted-foreground transition-colors focus-visible:outline-none focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/15 aria-invalid:border-destructive disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      type={type}
      {...props}
    />
  )
}

export { Input }
