import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'

import { getCachedGlobal } from '@/utilities/getGlobals'

/**
 * `/vorschau?key=…` – lets clients view the site while maintenance mode is on.
 * Enables Next.js draft mode for this browser (same mechanism as the editor preview), which the
 * page treats as a maintenance bypass. Drafts become visible too – the key is a secret.
 */
export async function GET(req: Request) {
  const key = new URL(req.url).searchParams.get('key')
  const siteInfo = await getCachedGlobal('site-info')()
  const expected = siteInfo?.maintenance?.bypassKey

  if (!key || !expected || key !== expected) {
    return new Response('Ungültiger Schlüssel.', { status: 403 })
  }

  ;(await draftMode()).enable()
  redirect('/')
}
