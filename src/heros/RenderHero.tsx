import React from 'react'

import type { Page } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { Media } from '@/components/Media'

export const RenderHero: React.FC<Page['hero']> = ({ type, title, text, links, media }) => {
  if (!type || type === 'none') return null

  const hasImage = type === 'image' && media && typeof media === 'object'

  return (
    <section className="container">
      {hasImage && (
        <div className="relative aspect-[3/2] sm:aspect-[16/9] lg:aspect-[5/2] overflow-hidden rounded-3xl md:rounded-[2rem]">
          <Media fill priority imgClassName="object-cover" resource={media} />
        </div>
      )}

      <div className={hasImage ? 'grid gap-6 md:gap-8 md:grid-cols-12 pt-10 md:pt-14 pb-6 md:pb-10' : 'grid gap-6 md:gap-8 md:grid-cols-12 pt-6 md:pt-16 pb-6 md:pb-10'}>
        {title && (
          <h1 className="text-[2.5rem] leading-[1.02] sm:text-6xl lg:text-7xl md:col-span-7 [hyphens:auto] sm:[hyphens:manual]">
            {title}
          </h1>
        )}
        {(text || (links && links.length > 0)) && (
          <div className="md:col-span-5 md:pt-3 flex flex-col gap-7">
            {text && (
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed whitespace-pre-line">
                {text}
              </p>
            )}
            {Array.isArray(links) && links.length > 0 && (
              <ul className="flex flex-wrap gap-3">
                {links.map(({ link }, i) => (
                  <li key={i}>
                    <CMSLink {...link} size="lg" />
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
