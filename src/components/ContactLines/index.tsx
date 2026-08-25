import React from 'react'

import type { SiteInfo } from '@/payload-types'

const tel = (n: string) => `tel:${n.replace(/[\s\-/]/g, '')}`

/** Address, phone numbers and e-mail from the site-info global. */
export const ContactLines: React.FC<{ siteInfo: SiteInfo }> = ({ siteInfo }) => (
  <>
    <address className="not-italic">
      {siteInfo.street && (
        <>
          {siteInfo.street}
          <br />
        </>
      )}
      {siteInfo.city}
    </address>
    <div className="mt-3 flex flex-col">
      {siteInfo.phone && (
        <a className="hover:underline" href={tel(siteInfo.phone)}>
          {siteInfo.phone}
        </a>
      )}
      {siteInfo.mobile && (
        <a className="hover:underline" href={tel(siteInfo.mobile)}>
          {siteInfo.mobile}
        </a>
      )}
      {siteInfo.email && (
        <a className="hover:underline" href={`mailto:${siteInfo.email}`}>
          {siteInfo.email}
        </a>
      )}
    </div>
  </>
)
