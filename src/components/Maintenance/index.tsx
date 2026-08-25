import React from 'react'

import type { SiteInfo } from '@/payload-types'

import { ContactLines } from '@/components/ContactLines'

/** Full-screen notice while maintenance mode is on – replaces header, content and footer. */
export const Maintenance: React.FC<{ siteInfo: SiteInfo }> = ({ siteInfo }) => (
  <main className="flex-1 flex flex-col items-center justify-center px-5 py-16 text-center">
    {/* horse mark from the favicon – Phosphor Icons, MIT */}
    <svg viewBox="0 0 256 256" className="size-14 fill-oak" aria-hidden="true">
      <path d="M202.05,55A103.24,103.24,0,0,0,128,24h-8a8,8,0,0,0-8,8V59.53L11.81,121.19a8,8,0,0,0-2.59,11.05l13.78,22,.3.43a31.84,31.84,0,0,0,31.34,12.83c13.93-2.36,38.62-6.54,61.4,3.29l-26.6,36.57A84.71,84.71,0,0,1,69.34,194,8,8,0,1,0,58.67,206a103.32,103.32,0,0,0,69.26,26l2.17,0a104,104,0,0,0,72-177ZM124,112a12,12,0,1,1,12-12A12,12,0,0,1,124,112Z" />
    </svg>

    <p className="mt-6 font-display text-xl text-muted-foreground">{siteInfo.name}</p>
    <h1 className="mt-3 max-w-2xl text-[2.5rem] leading-[1.02] sm:text-6xl">
      {siteInfo.maintenance?.title || 'Wir sind gleich wieder da.'}
    </h1>
    {siteInfo.maintenance?.text && (
      <p className="mt-6 max-w-xl text-lg md:text-xl text-muted-foreground leading-relaxed whitespace-pre-line">
        {siteInfo.maintenance.text}
      </p>
    )}

    {(siteInfo.street || siteInfo.phone || siteInfo.email) && (
      <div className="plate mt-12 w-full max-w-sm text-left text-lg leading-relaxed">
        <ContactLines siteInfo={siteInfo} />
      </div>
    )}
  </main>
)
