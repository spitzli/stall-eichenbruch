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

  const links = navItems.map(({ link }, i) => (
    <CMSLink key={i} {...link} appearance="inline" className="nav-link" />
  ))

  return (
    <header className="container">
      <div className="flex items-center justify-between py-6 md:py-8">
        <Link href="/" className="flex flex-col gap-1">
          <span className="font-display text-[1.6rem] md:text-3xl leading-none">
            {siteInfo?.name || 'Stall Eichenbruch'}
          </span>
          {siteInfo?.tagline && (
            <span className="hidden sm:block text-sm text-muted-foreground">{siteInfo.tagline}</span>
          )}
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-[15px]">{links}</nav>

        {/* ponytail: native <details> menu – no JS, no state */}
        {links.length > 0 && (
          <details className="md:hidden relative group">
            <summary className="list-none cursor-pointer select-none rounded-full border border-border px-4 py-2 text-sm bg-card [&::-webkit-details-marker]:hidden group-open:bg-foreground group-open:text-background">
              Menü
            </summary>
            <nav className="absolute right-0 top-full mt-3 z-30 plate min-w-52 flex flex-col gap-3 text-base">
              {links}
            </nav>
          </details>
        )}
      </div>
    </header>
  )
}
