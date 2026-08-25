import { cookies, draftMode } from 'next/headers'

import type { SiteInfo } from '@/payload-types'

export const BYPASS_COOKIE = 'maintenance_bypass'

/**
 * 'off'    – site is public
 * 'bypass' – maintenance is on, but this visitor may see the site (preview key cookie or draft mode)
 * 'on'     – show the maintenance notice
 */
export async function maintenanceState(siteInfo: SiteInfo): Promise<'off' | 'bypass' | 'on'> {
  const m = siteInfo?.maintenance
  if (!m?.enabled) return 'off'

  const [{ isEnabled: draft }, jar] = await Promise.all([draftMode(), cookies()])
  if (draft) return 'bypass'
  if (m.bypassKey && jar.get(BYPASS_COOKIE)?.value === m.bypassKey) return 'bypass'
  return 'on'
}
