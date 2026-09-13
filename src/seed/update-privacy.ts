/** Save a review draft only; never publish or replace the currently published privacy policy.
 * Run: NODE_ENV=production bun run payload run src/seed/update-privacy.ts
 */
import assert from 'node:assert/strict'
import { mkdir, writeFile } from 'node:fs/promises'
import { getPayload } from 'payload'
import config from '../payload.config'
import { privacyDraft } from './privacy-content'

const payload = await getPayload({ config })
const { docs } = await payload.find({
  collection: 'pages',
  where: { slug: { equals: 'datenschutz' } },
  draft: false,
  depth: 0,
  pagination: false,
})
assert.equal(docs.length, 1, 'Expected an existing privacy page; nothing changed.')
const published = docs[0]
const latest = await payload.findByID({
  collection: 'pages',
  id: published.id,
  draft: true,
  depth: 0,
})
// Updating an existing draft requires the exact timestamp of the revision just inspected.
const expectedDraftUpdatedAt = process.env.PRIVACY_EXPECTED_DRAFT_UPDATED_AT
assert(
  expectedDraftUpdatedAt
    ? latest._status === 'draft' && latest.updatedAt === expectedDraftUpdatedAt
    : latest._status === 'published',
  'Unpublished privacy edits exist or changed. Inspect them and provide PRIVACY_EXPECTED_DRAFT_UPDATED_AT before updating.',
)

const backup = `.backups/privacy-${Date.now()}`
await mkdir(backup, { recursive: true, mode: 0o700 })
await writeFile(`${backup}/published.json`, JSON.stringify(published, null, 2), { mode: 0o600 })
await writeFile(`${backup}/previous-draft.json`, JSON.stringify(latest, null, 2), { mode: 0o600 })
await payload.update({
  collection: 'pages',
  id: published.id,
  draft: true,
  data: { ...privacyDraft, meta: { ...published.meta, ...privacyDraft.meta } },
  context: { disableRevalidate: true },
})
const after = await payload.findByID({
  collection: 'pages',
  id: published.id,
  draft: false,
  depth: 0,
})
for (const field of ['title', 'hero', 'layout', 'meta', '_status'] as const) {
  assert.deepEqual(after[field], published[field], `Published ${field} unexpectedly changed.`)
}
const draft = await payload.findByID({
  collection: 'pages',
  id: published.id,
  draft: true,
  depth: 0,
})
assert.equal(draft._status, 'draft')
assert.equal(draft.layout.length, privacyDraft.layout.length)
payload.logger.info(`Privacy draft saved. Published version unchanged. Backup: ${backup}`)
process.exit(0)
