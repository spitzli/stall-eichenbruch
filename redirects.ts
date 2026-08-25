import type { NextConfig } from 'next'

/**
 * URL map: old WordPress site (stall-eichenbruch.de) → new site. Permanent (301/308).
 * Editors can add more under Admin → Redirects (those need a rebuild).
 */
// production domain as seen by Vercel (shortest custom domain, or the vercel.app alias if none is set)
const productionHost = process.env.VERCEL_PROJECT_PRODUCTION_URL
const isProduction = process.env.VERCEL_ENV === 'production'

export const redirects: NextConfig['redirects'] = async () => [
  // one canonical host: in production, *.vercel.app aliases redirect to the custom domain
  ...(isProduction && productionHost && !productionHost.endsWith('.vercel.app')
    ? [
        {
          source: '/:path*',
          has: [{ type: 'host' as const, value: '(?<host>.*\\.vercel\\.app)' }],
          destination: `https://${productionHost}/:path*`,
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
