import React from 'react'

import type { SiteInfo } from '@/payload-types'

import { formatHours } from '@/utilities/hours'

export const Hours: React.FC<{ hours: NonNullable<SiteInfo['hours']> }> = ({ hours }) => (
  <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1.5">
    {formatHours(hours).map(({ id, days, time }, i) => (
      <React.Fragment key={id || i}>
        <dt className="text-muted-foreground">{days}</dt>
        <dd className="tabular-nums">{time}</dd>
      </React.Fragment>
    ))}
  </dl>
)
