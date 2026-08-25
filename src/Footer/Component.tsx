import React from 'react'

import { CMSLink } from '@/components/Link'
import { ContactLines } from '@/components/ContactLines'
import { Hours } from '@/components/Hours'
import { getCachedGlobal } from '@/utilities/getGlobals'

export async function Footer() {
  const [footer, siteInfo] = await Promise.all([
    getCachedGlobal('footer', 1)(),
    getCachedGlobal('site-info')(),
  ])
  const navItems = footer?.navItems || []

  return (
    <footer className="mt-auto border-t border-border">
      <div className="container py-14 md:py-20 grid gap-10 md:grid-cols-12">
        <div className="md:col-span-5">
          <p className="font-display text-3xl">{siteInfo?.name}</p>
          {siteInfo?.tagline && <p className="mt-2 text-muted-foreground">{siteInfo.tagline}</p>}
        </div>

        <div className="md:col-span-3 text-[15px] leading-relaxed">
          <h3 className="text-lg mb-3">Kontakt</h3>
          <ContactLines siteInfo={siteInfo} />
        </div>

        {siteInfo?.hours && siteInfo.hours.length > 0 && (
          <div className="md:col-span-4 text-[15px]">
            <h3 className="text-lg mb-3">Stallzeiten</h3>
            <Hours hours={siteInfo.hours} />
          </div>
        )}
      </div>

      <div className="container pb-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
        <span>
          © {new Date().getFullYear()} {siteInfo?.name}
        </span>
        {navItems.map(({ link }, i) => (
          <CMSLink key={i} {...link} appearance="inline" className="hover:text-foreground" />
        ))}
        <a
          className="sm:ml-auto hover:text-foreground"
          href="https://spitzli.dev"
          rel="noopener noreferrer"
          target="_blank"
        >
          Website: Spitzli Development
        </a>
      </div>
    </footer>
  )
}
