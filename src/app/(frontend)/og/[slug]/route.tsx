import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { ImageResponse } from 'next/og'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

import type { Media } from '@/payload-types'
import { getServerSideURL } from '@/utilities/getURL'
import { SITE_NAME } from '@/utilities/site'

const WIDTH = 1200
const HEIGHT = 630

// read from disk – bundler URL imports are not supported for fonts in route handlers (see next.config outputFileTracingIncludes)
const fontPromise = readFile(path.join(process.cwd(), 'src/app/(frontend)/og/YoungSerif-Regular.ttf'))

/** Base64 data URL of the 1200×630 "og" rendition (or the original) of a media doc. */
async function photo(media: Media | number | null | undefined): Promise<string | null> {
  if (!media || typeof media !== 'object') return null
  const filename = media.sizes?.og?.filename || media.filename
  if (!filename) return null
  try {
    const res = await fetch(`${getServerSideURL()}/api/media/file/${encodeURIComponent(filename)}`)
    if (!res.ok) return null
    const buf = Buffer.from(await res.arrayBuffer())
    return `data:${media.mimeType || 'image/jpeg'};base64,${buf.toString('base64')}`
  } catch {
    return null
  }
}

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const payload = await getPayload({ config: configPromise })

  const [{ docs }, siteInfo, font] = await Promise.all([
    payload.find({
      collection: 'pages',
      where: { slug: { equals: decodeURIComponent(slug) } },
      limit: 1,
      depth: 1,
      draft: false,
      overrideAccess: false,
    }),
    payload.findGlobal({ slug: 'site-info', depth: 0 }),
    fontPromise,
  ])
  const page = docs[0]
  if (!page) return new Response('Not found', { status: 404 })

  const title = page.hero?.title || page.meta?.title || page.title
  const image = await photo(page.meta?.image || page.hero?.media)
  const name = siteInfo?.name || SITE_NAME
  const place = siteInfo?.city?.replace(/^\d+\s*/, '') || ''

  return new ImageResponse(
    (
      <div
        style={{
          width: WIDTH,
          height: HEIGHT,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          background: image ? `url(${image})` : '#2a5a3f',
          backgroundSize: '1200px 630px',
          fontFamily: 'Young Serif',
          color: '#17251c',
        }}
      >
        {/* stall name plate – same motif as the site */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            margin: '0 48px 48px 48px',
            padding: '36px 44px 40px 44px',
            background: '#ffffff',
            borderTop: '10px solid #8b5e34',
            borderRadius: 24,
            boxShadow: '0 24px 60px rgba(23,37,28,0.35)',
          }}
        >
          <div
            style={{
              fontSize: title.length > 40 ? 52 : 64,
              lineHeight: 1.05,
              letterSpacing: -0.5,
              textWrap: 'balance',
            }}
          >
            {title}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', marginTop: 22, fontSize: 24, color: '#5f6b62' }}>
            <div style={{ width: 28, height: 8, background: '#e8c766', borderRadius: 4, marginRight: 16 }} />
            {name}
            {place ? ` · ${place}` : ''}
          </div>
        </div>
      </div>
    ),
    {
      width: WIDTH,
      height: HEIGHT,
      fonts: [{ name: 'Young Serif', data: font, weight: 400, style: 'normal' }],
      headers: {
        'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
      },
    },
  )
}
