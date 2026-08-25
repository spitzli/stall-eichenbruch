import type { Metadata } from 'next'

import { PayloadRedirects } from '@/components/PayloadRedirects'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { draftMode } from 'next/headers'
import React, { cache } from 'react'

import { getCachedGlobal } from '@/utilities/getGlobals'
import { maintenanceState } from '@/utilities/maintenance'
import { RenderBlocks } from '@/blocks/RenderBlocks'
import { RenderHero } from '@/heros/RenderHero'
import { generateMeta } from '@/utilities/generateMeta'
import { LivePreviewListener } from '@/components/LivePreviewListener'

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const pages = await payload.find({
    collection: 'pages',
    draft: false,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    select: {
      slug: true,
    },
  })

  return pages.docs.filter((doc) => doc.slug !== 'home').map(({ slug }) => ({ slug }))
}

type Args = {
  params: Promise<{
    slug?: string
  }>
}

export default async function Page({ params: paramsPromise }: Args) {
  const { isEnabled: draft } = await draftMode()
  const { slug = 'home' } = await paramsPromise
  const decodedSlug = decodeURIComponent(slug)
  const url = '/' + decodedSlug

  const [page, siteInfo] = await Promise.all([
    queryPageBySlug({ slug: decodedSlug }),
    getCachedGlobal('site-info')(),
  ])

  // maintenance 'on' is rendered by the root layout (no header/footer); here we only add the preview hint
  const maintenance = await maintenanceState(siteInfo)
  if (maintenance === 'on') return null

  if (!page) {
    return <PayloadRedirects url={url} />
  }

  const { hero, layout } = page

  return (
    <main className="pt-2 pb-16 md:pb-24">
      {maintenance === 'bypass' && (
        <p className="container mb-4 text-sm text-muted-foreground">
          <span className="inline-block rounded-md bg-hay/60 px-2 py-0.5 text-foreground">Vorschau</span>{' '}
          Wartungsmodus ist aktiv – Besucher sehen diese Seite nicht.
        </p>
      )}
      <PayloadRedirects disableNotFound url={url} />
      {draft && <LivePreviewListener />}

      <RenderHero {...hero} />
      <RenderBlocks blocks={layout} />
    </main>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug = 'home' } = await paramsPromise
  const page = await queryPageBySlug({ slug: decodeURIComponent(slug) })

  // no "noindex" during maintenance – proxy.ts answers with 503 instead, which keeps the index intact
  return generateMeta({ doc: page })
}

const queryPageBySlug = cache(async ({ slug }: { slug: string }) => {
  const { isEnabled: draft } = await draftMode()

  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'pages',
    draft,
    limit: 1,
    pagination: false,
    overrideAccess: draft,
    where: {
      slug: {
        equals: slug,
      },
    },
  })

  return result.docs?.[0] || null
})
