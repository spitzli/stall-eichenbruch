import Link from 'next/link'
import React from 'react'

import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="container py-28 max-w-3xl">
      <h1 className="text-5xl md:text-6xl">Hier steht kein Pferd.</h1>
      <p className="mt-5 text-lg text-muted-foreground">
        Die Seite gibt es nicht – vielleicht wurde sie verschoben.
      </p>
      <Button asChild className="mt-8">
        <Link href="/">Zur Startseite</Link>
      </Button>
    </div>
  )
}
