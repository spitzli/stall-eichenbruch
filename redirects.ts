import type { NextConfig } from 'next'

import { getServerSideURL } from './src/utilities/getURL'

/**
 * URL map: old WordPress site (stall-eichenbruch.de) → new site. Permanent (301/308).
 * Editors can add more under Admin → Redirects (those need a rebuild).
 */
export const redirects: NextConfig['redirects'] = async () => {
  // canonical site URL: SITE_URL, falling back to the Vercel production domain
  const site = new URL(getServerSideURL())
  const canonicalHost =
    process.env.VERCEL_ENV === 'production' && site.hostname !== 'localhost' ? site.host : null

  return [
    // one canonical host: *.vercel.app aliases redirect to the site URL in production
    ...(canonicalHost && !canonicalHost.endsWith('.vercel.app')
      ? [
          {
            source: '/:path*',
            has: [{ type: 'host' as const, value: '(?<host>.*\\.vercel\\.app)' }],
            destination: `${site.origin}/:path*`,
            permanent: true,
          },
        ]
      : []),
    // old paths of the previous website
    { source: '/wir-uber-uns', destination: '/wir-ueber-uns', permanent: true },
    { source: '/impressum/datenschutzerklaerung', destination: '/datenschutz', permanent: true },
    { source: '/datenschutzerklaerung', destination: '/datenschutz', permanent: true },
    // index files and the internal home slug – one canonical URL for the start page
    { source: '/index.html', destination: '/', permanent: true },
    { source: '/index.php', destination: '/', permanent: true },
    { source: '/home', destination: '/', permanent: true },
  ]
}
