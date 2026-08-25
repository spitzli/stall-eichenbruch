import React from 'react'

import { getCachedGlobal } from '@/utilities/getGlobals'

/**
 * Call / e-mail bar for phones. Placed after the footer and `sticky bottom-0`, so it floats while
 * scrolling and rests at the very end of the page without covering the footer.
 */
export async function MobileBar() {
  const siteInfo = await getCachedGlobal('site-info')()
  if (!siteInfo?.phone && !siteInfo?.email) return null

  return (
    <div className="sticky bottom-0 z-20 md:hidden border-t border-border bg-card/95 backdrop-blur px-5 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      <div className="flex gap-3">
        {siteInfo.phone && (
          <a
            href={`tel:${siteInfo.phone.replace(/[\s\-/]/g, '')}`}
            className="flex-1 inline-flex h-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-medium"
          >
            Anrufen
          </a>
        )}
        {siteInfo.email && (
          <a
            href={`mailto:${siteInfo.email}`}
            className="flex-1 inline-flex h-12 items-center justify-center rounded-full border border-foreground/25 font-medium"
          >
            E-Mail
          </a>
        )}
      </div>
    </div>
  )
}
