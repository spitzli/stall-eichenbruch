/** Import web photos without deleting originals; update only image references on existing pages.
 * Run: bun run payload run src/seed/update-photos.ts
 * Requires Blob storage so uploads survive the production deployment.
 */
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { getPayload } from 'payload'
import { BlobNotFoundError, head } from '@vercel/blob'
import config from '../payload.config'
import type { Media, Page } from '../payload-types'
import { applyPhotoPlacement } from './photo-placement'

const payload = await getPayload({ config })
assert(process.env.BLOB_READ_WRITE_TOKEN, 'Blob storage is required; refusing local-only uploads.')
// Cloud-storage hooks mutate req.context; never share one object between operations.
const context = () => ({ disableRevalidate: true })
async function filesStored(media: Media): Promise<boolean> {
  const filenames = [
    media.filename,
    ...Object.values(media.sizes || {}).map((size) => size?.filename),
  ].filter((name): name is string => Boolean(name))
  const present = await Promise.all(
    filenames.map(async (filename) => {
      try {
        await head(filename, { token: process.env.BLOB_READ_WRITE_TOKEN })
        return true
      } catch (error) {
        if (error instanceof BlobNotFoundError) return false
        throw error
      }
    }),
  )
  return present.length > 0 && present.every(Boolean)
}
const manifest: {
  source: string
  name: string
  alt: string
  focalX?: number
  focalY?: number
  files: { url: string; bytes: number; width: number; height: number }[]
}[] = JSON.parse(await readFile('docs/photos-manifest.json', 'utf8'))
const { docs: pages } = await payload.find({
  collection: 'pages',
  depth: 0,
  draft: true,
  pagination: false,
})
const { docs: media } = await payload.find({ collection: 'media', depth: 0, pagination: false })
for (const slug of ['home', 'pension', 'ausbildung', 'wir-ueber-uns']) {
  const page = pages.find((page) => page.slug === slug)
  assert(page?._status === 'published', `Missing page or unpublished changes on ${slug}; stopping.`)
}

// Validate all assets before the first upload or content write.
const assets = await Promise.all(
  manifest.map(async (photo) => {
    const master = photo.files.find((file) => file.url.endsWith(`/${photo.name}.webp`))
    assert(master && master.url.startsWith('/images/stall/'), `Missing master for ${photo.name}`)
    const data = await readFile(path.join('public', master.url))
    assert.equal(data.length, master.bytes, `Stale manifest for ${photo.name}`)
    const hash = createHash('sha256').update(data).digest('hex').slice(0, 12)
    return { ...photo, data, filename: `${photo.name}-${hash}.webp` }
  }),
)

const backup = path.join('.backups', `photos-${Date.now()}`)
await mkdir(backup, { recursive: true, mode: 0o700 })
await writeFile(path.join(backup, 'cms.json'), JSON.stringify({ pages, media }, null, 2), {
  mode: 0o600,
})
const ids: Record<string, number> = {}
const replacements = new Map<number, number>()
for (const photo of assets) {
  const existing = media.find((item) => item.filename === photo.filename)
  const upload = {
    collection: 'media' as const,
    data: { alt: photo.alt, focalX: photo.focalX ?? 50, focalY: photo.focalY ?? 50 },
    file: {
      name: photo.filename,
      data: photo.data,
      mimetype: 'image/webp',
      size: photo.data.length,
    },
    context: context(),
  }
  const uploaded = existing
    ? (await filesStored(existing))
      ? existing
      : await payload.update({ ...upload, id: existing.id, overwriteExistingFiles: true })
    : await payload.create(upload)
  assert(
    await filesStored(uploaded),
    `Blob verification failed for ${photo.name}; pages not changed.`,
  )
  ids[photo.name] = uploaded.id
  for (const old of media.filter((item) => item.filename === path.basename(photo.source))) {
    replacements.set(old.id, uploaded.id)
  }
}
await writeFile(path.join(backup, 'imported-ids.json'), JSON.stringify(ids, null, 2), {
  mode: 0o600,
})

for (const page of pages) {
  if (!['home', 'pension', 'ausbildung', 'wir-ueber-uns'].includes(page.slug || '')) continue
  const ref = (value: number | { id: number } | null | undefined) => {
    const id = typeof value === 'object' ? value?.id : value
    return id == null ? id : replacements.get(id) || id
  }
  const updated: Page = {
    ...page,
    hero: { ...page.hero, media: ref(page.hero.media) },
    meta: { ...page.meta, image: ref(page.meta?.image) },
    layout: page.layout.map((block) => {
      if (block.blockType === 'mediaBlock') return { ...block, media: ref(block.media) as number }
      return block
    }),
  }
  const placed = applyPhotoPlacement(updated, ids)
  const { hero, layout, meta } = placed
  await payload.update({
    collection: 'pages',
    id: page.id,
    data: { hero, layout, meta },
    context: context(),
  })
}
payload.logger.info(
  `Imported/reused ${assets.length} web photos. Originals retained. Backup: ${backup}`,
)
payload.logger.info('Redeploy Next.js to invalidate cached media/page content.')
process.exit(0)
