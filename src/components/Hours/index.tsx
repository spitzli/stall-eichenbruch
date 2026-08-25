import React from 'react'

import type { SiteInfo } from '@/payload-types'

export const Hours: React.FC<{ hours: NonNullable<SiteInfo['hours']> }> = ({ hours }) => (
  <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1.5">
    {hours.map(({ label, value, id }) => (
      <React.Fragment key={id || label}>
        <dt className="text-muted-foreground">{label}</dt>
        <dd className="tabular-nums">{value}</dd>
      </React.Fragment>
    ))}
  </dl>
)
