import type { Metadata } from 'next'

import type { Page } from '../payload-types'

import { mergeOpenGraph } from './mergeOpenGraph'
import { getServerSideURL } from './getURL'
import { SITE_DESCRIPTION } from './site'

/** First ~155 characters of a text, cut at a word boundary. */
export const excerpt = (text?: string | null, max = 155) => {
  if (!text) return undefined
  const clean = text.replace(/\s+/g, ' ').trim()
  if (clean.length <= max) return clean
  return clean.slice(0, max).replace(/\s\S*$/, '') + ' …'
}

export const generateMeta = async (args: { doc: Partial<Page> | null }): Promise<Metadata> => {
  const { doc } = args
  const path = !doc?.slug || doc.slug === 'home' ? '/' : `/${doc.slug}`
  const title = doc?.meta?.title || doc?.title || undefined
  const description = doc?.meta?.description || excerpt(doc?.hero?.text) || SITE_DESCRIPTION
  // ponytail: one dynamic OG image per page (hero photo + title), see app/(frontend)/og/[slug]
  const ogImage = doc?.slug ? `${getServerSideURL()}/og/${doc.slug}` : undefined

  return {
    // home carries the brand itself; other pages get the "| Stall Eichenbruch" template from the layout
    title: title && doc?.slug === 'home' ? { absolute: title } : title,
    description,
    alternates: { canonical: path },
    openGraph: mergeOpenGraph({
      title,
      description,
      url: path,
      images: ogImage ? [{ url: ogImage, width: 1200, height: 630, alt: title }] : undefined,
    }),
    twitter: { card: 'summary_large_image', title, description },
  }
}
