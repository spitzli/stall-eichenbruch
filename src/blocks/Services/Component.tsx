import React from 'react'

import type { ServicesBlock as Props } from '@/payload-types'

import { SectionHead } from '@/components/SectionHead'

export const ServicesBlock: React.FC<Props> = ({ heading, intro, items }) => (
  <>
    <SectionHead heading={heading} intro={intro} />
    <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {items?.map(({ id, title, text, price }) => (
        <article key={id || title} className="plate flex flex-col gap-3">
          <h3 className="text-2xl">{title}</h3>
          <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{text}</p>
          {price && (
            <p className="mt-auto pt-4">
              <span className="inline-block rounded-md bg-hay/60 px-2 py-0.5 font-medium tabular-nums">
                {price}
              </span>
            </p>
          )}
        </article>
      ))}
    </div>
  </>
)
