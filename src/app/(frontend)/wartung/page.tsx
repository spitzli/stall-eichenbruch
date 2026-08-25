import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { getCachedGlobal } from '@/utilities/getGlobals'

export const dynamic = 'force-dynamic'

/**
 * Source of the maintenance HTML. proxy.ts fetches this page and re-serves it with status 503.
 * The root layout renders the actual notice when maintenance is on; without maintenance this is a 404.
 */
export default async function MaintenancePage() {
  const siteInfo = await getCachedGlobal('site-info')()
  if (!siteInfo?.maintenance?.enabled) notFound()
  return null
}

export async function generateMetadata(): Promise<Metadata> {
  const siteInfo = await getCachedGlobal('site-info')()
  return { title: { absolute: siteInfo?.maintenance?.title || 'Wartung' }, robots: { index: false, follow: false } }
}
