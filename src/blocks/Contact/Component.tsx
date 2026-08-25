import React from 'react'

import type { ContactBlock as Props } from '@/payload-types'

import { ContactLines } from '@/components/ContactLines'
import { Hours } from '@/components/Hours'
import { SectionHead } from '@/components/SectionHead'
import { getCachedGlobal } from '@/utilities/getGlobals'

export async function ContactBlock({ heading, text }: Props) {
  const siteInfo = await getCachedGlobal('site-info')()
  const hasHours = siteInfo.hours && siteInfo.hours.length > 0

  return (
    <>
      <SectionHead heading={heading} intro={text} />
      <div className="mt-10 grid gap-5 md:grid-cols-2">
        <div className="plate text-lg leading-relaxed">
          <h3 className="text-2xl mb-1">{siteInfo.name}</h3>
          {siteInfo.tagline && <p className="text-muted-foreground mb-4">{siteInfo.tagline}</p>}
          <ContactLines siteInfo={siteInfo} />
          {siteInfo.mapsUrl && (
            <a
              className="mt-6 inline-block underline decoration-hay decoration-2 underline-offset-4 hover:decoration-primary"
              href={siteInfo.mapsUrl}
              rel="noopener noreferrer"
              target="_blank"
            >
              Route planen ↗
            </a>
          )}
        </div>

        {hasHours && (
          <div className="plate text-lg">
            <h3 className="text-2xl mb-4">Stallzeiten</h3>
            <Hours hours={siteInfo.hours!} />
          </div>
        )}
      </div>
    </>
  )
}
