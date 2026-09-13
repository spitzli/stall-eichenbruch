/** Apply confirmed facility/training corrections and add one replaceable CMS photo placeholder.
 * Run: NODE_ENV=production bun run payload run src/seed/update-owner-corrections.ts
 * No reseeding, no legal-page changes, no overwrite of real replacement photos.
 */
import assert from 'node:assert/strict'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { getPayload } from 'payload'
import config from '../payload.config'
import type { Page } from '../payload-types'
import { SITE_DESCRIPTION } from '../utilities/site'
import { filesStored } from './media-storage'
import {
  applyOwnerCorrections,
  findWalkerPhoto,
  longierPhotoAlt,
  walkerPlaceholderAlt,
  walkerPlaceholderFilename,
} from './owner-corrections'

const payload = await getPayload({ config })
assert(process.env.BLOB_READ_WRITE_TOKEN, 'Blob storage is required for the placeholder.')
const slugs = ['home', 'pension', 'ausbildung', 'wir-ueber-uns']
const { docs: pages } = await payload.find({
  collection: 'pages',
  where: { slug: { in: slugs } },
  draft: true,
  depth: 0,
  pagination: false,
})
assert.equal(pages.length, slugs.length, 'Expected all four content pages.')
assert(
  pages.every((page) => page._status === 'published'),
  'Unpublished content edits exist; inspect before updating.',
)
const { docs: media } = await payload.find({ collection: 'media', depth: 0, pagination: false })
const site = await payload.findGlobal({ slug: 'site-info', depth: 0 })
const backup = `.backups/owner-corrections-${Date.now()}`
await mkdir(backup, { recursive: true, mode: 0o700 })
await writeFile(
  `${backup}/content.json`,
  JSON.stringify({ pages, media, description: site.description }, null, 2),
  { mode: 0o600 },
)

let walker = findWalkerPhoto(media)
if (!walker || !(await filesStored(walker))) {
  assert(
    !walker || walker.filename === walkerPlaceholderFilename,
    'A real Führmaschine photo is missing from Blob; refusing to replace it with a placeholder.',
  )
  const data = await readFile(`public/images/stall/${walkerPlaceholderFilename}`)
  const upload = {
    collection: 'media' as const,
    data: { alt: walkerPlaceholderAlt },
    file: { name: walkerPlaceholderFilename, data, mimetype: 'image/webp', size: data.length },
    context: { disableRevalidate: true },
  }
  walker = walker
    ? await payload.update({ ...upload, id: walker.id, overwriteExistingFiles: true })
    : await payload.create(upload)
}
assert(await filesStored(walker), 'Placeholder master or thumbnail missing from Blob.')

for (const photo of media.filter((item) => item.filename?.startsWith('longierzelt'))) {
  if (photo.alt === longierPhotoAlt) continue
  await payload.update({
    collection: 'media',
    id: photo.id,
    data: { alt: longierPhotoAlt },
    context: { disableRevalidate: true },
  })
}

for (const page of pages) {
  const { hero, layout, meta } = applyOwnerCorrections(page, walker.id)
  // Skip unchanged documents on repeated runs instead of creating redundant versions.
  if (
    JSON.stringify({ hero, layout, meta }) ===
    JSON.stringify({ hero: page.hero, layout: page.layout, meta: page.meta })
  )
    continue
  await payload.update({
    collection: 'pages',
    id: page.id,
    data: { hero, layout, meta },
    context: { disableRevalidate: true },
  })
}
if (site.description !== SITE_DESCRIPTION) {
  await payload.updateGlobal({
    slug: 'site-info',
    data: { description: SITE_DESCRIPTION },
    context: { disableRevalidate: true },
  })
}
const { docs: verified } = await payload.find({
  collection: 'pages',
  where: { slug: { in: slugs } },
  draft: false,
  depth: 0,
  pagination: false,
})
for (const page of verified) {
  const expected: Page = applyOwnerCorrections(page, walker.id)
  assert.deepEqual(page.hero, expected.hero)
  assert.deepEqual(page.layout, expected.layout)
  assert.deepEqual(page.meta, expected.meta)
}
payload.logger.info(`Corrections verified. Führmaschine media ID: ${walker.id}. Backup: ${backup}`)
payload.logger.info(
  'Replace this media record’s file and alt text in Payload when the real photo is available. Refresh Next.js caches on the next deployment.',
)
process.exit(0)
