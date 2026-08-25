import { cn } from '@/utilities/ui'
import * as React from 'react'

const Textarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = ({
  className,
  ...props
}) => {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        'flex field-sizing-content min-h-32 w-full rounded-xl border border-input bg-background px-4 py-3 text-base placeholder:text-muted-foreground transition-colors focus-visible:outline-none focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/15 aria-invalid:border-destructive disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  )
}

export { Textarea }
