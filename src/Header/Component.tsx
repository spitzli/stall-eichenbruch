import Link from 'next/link'
import React from 'react'

import { CMSLink } from '@/components/Link'
import { MobileMenu } from './MobileMenu'
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

        {navItems.length > 0 && (
          <MobileMenu>
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
          </MobileMenu>
        )}
      </div>
    </header>
  )
}
