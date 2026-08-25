import type { Metadata, Viewport } from 'next'

import { cn } from '@/utilities/ui'
import { Albert_Sans, Young_Serif } from 'next/font/google'
import React from 'react'

import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { AdminBar } from '@/components/AdminBar'
import { Footer } from '@/Footer/Component'
import { Header } from '@/Header/Component'
import { Maintenance } from '@/components/Maintenance'
import { MobileBar } from '@/components/MobileBar'
import { getCachedGlobal } from '@/utilities/getGlobals'
import { openingHoursSpecification } from '@/utilities/hours'
import { maintenanceState } from '@/utilities/maintenance'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import { SITE_DESCRIPTION, SITE_NAME } from '@/utilities/site'
import { draftMode } from 'next/headers'

import './globals.css'
import { getServerSideURL } from '@/utilities/getURL'

const display = Young_Serif({ subsets: ['latin'], weight: '400', variable: '--font-young-serif' })
const sans = Albert_Sans({ subsets: ['latin'], variable: '--font-albert-sans' })

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [{ isEnabled }, siteInfo] = await Promise.all([draftMode(), getCachedGlobal('site-info')()])
  const maintenance = await maintenanceState(siteInfo)

  const url = getServerSideURL()
  const [postalCode, ...locality] = (siteInfo?.city || '').split(' ')
  // Local-SEO structured data: one LocalBusiness + WebSite entity for the whole site
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': ['LocalBusiness', 'SportsActivityLocation'],
        '@id': `${url}/#business`,
        name: siteInfo?.name || SITE_NAME,
        description: siteInfo?.description || SITE_DESCRIPTION,
        url,
        image: `${url}/og/home`,
        telephone: siteInfo?.phone || undefined,
        email: siteInfo?.email || undefined,
        address: siteInfo?.street
          ? {
              '@type': 'PostalAddress',
              streetAddress: siteInfo.street,
              postalCode,
              addressLocality: locality.join(' '),
              addressCountry: 'DE',
            }
          : undefined,
        hasMap: siteInfo?.mapsUrl || undefined,
        openingHoursSpecification: siteInfo?.hours?.length
          ? openingHoursSpecification(siteInfo.hours)
          : undefined,
      },
      {
        '@type': 'WebSite',
        '@id': `${url}/#website`,
        name: siteInfo?.name || SITE_NAME,
        url,
        inLanguage: 'de-DE',
        publisher: { '@id': `${url}/#business` },
      },
    ],
  }

  return (
    <html className={cn(display.variable, sans.variable)} lang="de" data-scroll-behavior="smooth">
      <head>
        <link href="/favicon.ico" rel="icon" sizes="32x32" />
        <link href="/favicon.svg" rel="icon" type="image/svg+xml" />
        <link href="/apple-touch-icon.png" rel="apple-touch-icon" sizes="180x180" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        {maintenance === 'on' ? (
          <Maintenance siteInfo={siteInfo} />
        ) : (
          <>
            <AdminBar adminBarProps={{ preview: isEnabled }} />
            <Header />
            {children}
            <Footer />
            <MobileBar />
          </>
        )}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}

export const viewport: Viewport = {
  themeColor: '#f4f6f2',
  viewportFit: 'cover',
}

export const metadata: Metadata = {
  metadataBase: new URL(getServerSideURL()),
  title: { default: SITE_NAME, template: `%s | ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  openGraph: mergeOpenGraph(),
  robots: { index: true, follow: true },
  alternates: { canonical: '/' },
}
