import { NextResponse, type NextRequest } from 'next/server'

/**
 * Maintenance mode gate.
 *
 * SEO rule: while maintenance is on, pages answer with 503 + Retry-After so search engines keep the
 * index and come back later. A 200 with "noindex" would drop the pages. robots.txt, sitemaps, the
 * admin, the API and OG images are never affected (see matcher).
 */

const TTL_MS = 15_000
let cached: { enabled: boolean; expires: number } | undefined

async function maintenanceEnabled(origin: string): Promise<boolean> {
  if (cached && cached.expires > Date.now()) return cached.enabled
  try {
    const res = await fetch(`${origin}/api/globals/site-info?depth=0&select[maintenance]=true`, {
      cache: 'no-store',
    })
    const data = res.ok ? await res.json() : {}
    cached = { enabled: Boolean(data?.maintenance?.enabled), expires: Date.now() + TTL_MS }
  } catch {
    cached = { enabled: false, expires: Date.now() + TTL_MS }
  }
  return cached.enabled
}

export async function proxy(req: NextRequest) {
  // draft mode (editor preview or /vorschau key) bypasses maintenance – the page decides the rest
  if (req.cookies.has('__prerender_bypass')) return NextResponse.next()
  if (!(await maintenanceEnabled(req.nextUrl.origin))) return NextResponse.next()

  const page = await fetch(new URL('/wartung', req.url), { cache: 'no-store' })
  return new NextResponse(await page.text(), {
    status: 503,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'retry-after': '3600',
      'cache-control': 'no-store',
    },
  })
}

export const config = {
  // everything except: Next internals, admin, API, preview routes, the maintenance page itself,
  // OG images and any file with an extension (robots.txt, sitemaps, favicons, media)
  matcher: ['/((?!_next|admin|api|next|vorschau|wartung|og|.*\\..*).*)'],
}
