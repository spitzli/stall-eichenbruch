import Link from 'next/link'
import React from 'react'

import { CMSLink } from '@/components/Link'
import { getCachedGlobal } from '@/utilities/getGlobals'

export async function Header() {
  const [header, siteInfo] = await Promise.all([
    getCachedGlobal('header', 1)(),
    getCachedGlobal('site-info')(),
  ])
  const navItems = header?.navItems || []

  return (
    <header className="container relative">
      <div className="flex items-center justify-between py-5 md:py-8">
        <Link href="/" className="flex flex-col gap-1">
          <span className="font-display text-[1.6rem] md:text-3xl leading-none">
            {siteInfo?.name || 'Stall Eichenbruch'}
          </span>
          {siteInfo?.tagline && (
            <span className="hidden sm:block text-sm text-muted-foreground">{siteInfo.tagline}</span>
          )}
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-[15px]">
          {navItems.map(({ link }, i) => (
            <CMSLink key={i} {...link} appearance="inline" className="nav-link" />
          ))}
        </nav>

        {/* ponytail: native <details> menu – no JS, no state; panel spans the full width below the header */}
        {navItems.length > 0 && (
          <details className="md:hidden group">
            <summary className="list-none cursor-pointer select-none rounded-full border border-border px-4 py-2.5 text-sm bg-card [&::-webkit-details-marker]:hidden group-open:bg-foreground group-open:text-background">
              <span className="group-open:hidden">Menü</span>
              <span className="hidden group-open:inline">Schliessen</span>
            </summary>
            <nav className="absolute left-5 right-5 top-full z-30 plate p-2 md:p-2 flex flex-col divide-y divide-border">
              {navItems.map(({ link }, i) => (
                <CMSLink
                  key={i}
                  {...link}
                  appearance="inline"
                  className="font-display text-2xl px-4 py-4 rounded-xl hover:bg-background"
                />
              ))}
              {siteInfo?.phone && (
                <a
                  className="px-4 py-4 text-muted-foreground"
                  href={`tel:${siteInfo.phone.replace(/[\s\-/]/g, '')}`}
                >
                  Anrufen: {siteInfo.phone}
                </a>
              )}
            </nav>
          </details>
        )}
      </div>
    </header>
  )
}
