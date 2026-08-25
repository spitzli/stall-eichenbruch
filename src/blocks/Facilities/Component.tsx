import React from 'react'

import type { FacilitiesBlock as Props } from '@/payload-types'

import { SectionHead } from '@/components/SectionHead'

export const FacilitiesBlock: React.FC<Props> = ({ heading, intro, items }) => (
  <>
    <SectionHead heading={heading} intro={intro} />
    <dl className="mt-10 grid md:grid-cols-2 gap-x-16">
      {items?.map(({ id, label, value }) => (
        <div
          key={id || label}
          className="flex items-baseline justify-between gap-6 py-4 border-b border-border"
        >
          <dt className="text-muted-foreground">{label}</dt>
          <dd className="font-display text-xl md:text-2xl text-right tabular-nums">{value}</dd>
        </div>
      ))}
    </dl>
  </>
)
