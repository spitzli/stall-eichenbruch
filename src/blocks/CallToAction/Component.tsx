import React from 'react'

import type { CallToActionBlock as Props } from '@/payload-types'

import { CMSLink } from '@/components/Link'

export const CallToActionBlock: React.FC<Props> = ({ heading, text, links }) => (
  <div className="rounded-[2rem] bg-primary text-primary-foreground p-8 md:p-14 grid gap-8 md:grid-cols-12 md:items-center">
    <div className="md:col-span-8">
      <h2 className="text-3xl md:text-5xl">{heading}</h2>
      {text && <p className="mt-4 text-lg md:text-xl opacity-85 leading-relaxed whitespace-pre-line">{text}</p>}
    </div>
    {links && links.length > 0 && (
      <div className="md:col-span-4 flex flex-wrap gap-3 md:justify-end">
        {links.map(({ link }, i) => (
          <CMSLink
            key={i}
            size="lg"
            {...link}
            className={
              link.appearance === 'outline'
                ? 'border-primary-foreground/40 text-primary-foreground hover:border-primary-foreground hover:bg-transparent'
                : 'bg-card text-primary hover:bg-hay hover:text-foreground'
            }
          />
        ))}
      </div>
    )}
  </div>
)
