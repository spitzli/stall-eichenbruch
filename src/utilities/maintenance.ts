import { draftMode } from 'next/headers'

import type { SiteInfo } from '@/payload-types'

/**
 * 'off'    – site is public
 * 'bypass' – maintenance is on, but this visitor is in draft mode (editor preview or /vorschau key)
 * 'on'     – show the maintenance notice
 *
 * Only draftMode() is consulted so pages stay statically renderable (cookies() would opt the page out of ISR
 * and break background regeneration).
 */
export async function maintenanceState(siteInfo: SiteInfo): Promise<'off' | 'bypass' | 'on'> {
  if (!siteInfo?.maintenance?.enabled) return 'off'
  const { isEnabled } = await draftMode()
  return isEnabled ? 'bypass' : 'on'
}
