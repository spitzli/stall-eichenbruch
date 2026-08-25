'use client'

import { usePathname } from 'next/navigation'
import React from 'react'

/** Native <details> menu; re-mounted (closed) on every route change because the layout persists across navigations. */
export const MobileMenu: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname()

  return (
    <details key={pathname} className="md:hidden group">
      <summary className="list-none cursor-pointer select-none rounded-full border border-border px-4 py-2.5 text-sm bg-card [&::-webkit-details-marker]:hidden group-open:bg-foreground group-open:text-background">
        <span className="group-open:hidden">Menü</span>
        <span className="hidden group-open:inline">Schliessen</span>
      </summary>
      <nav className="absolute left-5 right-5 top-full z-30 plate p-2 md:p-2 flex flex-col divide-y divide-border">
        {children}
      </nav>
    </details>
  )
}
