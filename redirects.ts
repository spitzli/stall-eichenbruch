import type { NextConfig } from 'next'

/**
 * URL map: old WordPress site (stall-eichenbruch.de) → new site. Permanent (301/308).
 * Editors can add more under Admin → Redirects (those need a rebuild).
 */
export const redirects: NextConfig['redirects'] = async () => [
  // old paths of the previous website
  { source: '/wir-uber-uns', destination: '/wir-ueber-uns', permanent: true },
  { source: '/impressum/datenschutzerklaerung', destination: '/datenschutz', permanent: true },
  { source: '/datenschutzerklaerung', destination: '/datenschutz', permanent: true },
  // index files and the internal home slug – one canonical URL for the start page
  { source: '/index.html', destination: '/', permanent: true },
  { source: '/index.php', destination: '/', permanent: true },
  { source: '/home', destination: '/', permanent: true },
]
