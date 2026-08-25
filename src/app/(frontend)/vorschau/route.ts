import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

import { getCachedGlobal } from '@/utilities/getGlobals'
import { BYPASS_COOKIE } from '@/utilities/maintenance'

/** `/vorschau?key=…` – lets clients view the site while maintenance mode is on. */
export async function GET(req: Request) {
  const key = new URL(req.url).searchParams.get('key')
  const siteInfo = await getCachedGlobal('site-info')()
  const expected = siteInfo?.maintenance?.bypassKey

  if (!key || !expected || key !== expected) {
    return new Response('Ungültiger Schlüssel.', { status: 403 })
  }

  ;(await cookies()).set(BYPASS_COOKIE, key, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  })
  redirect('/')
}
