// Run: bun src/seed/representation.check.ts
import assert from 'node:assert/strict'
import { representation } from './representation'

const original = {
  slug: 'home',
  title: 'Startseite',
  hero: { type: 'image' as const, media: 7 },
  layout: [
    { blockType: 'gallery' as const, images: [7, 8] },
    { blockType: 'team' as const, heading: 'Unsere Mitarbeiter', members: [] },
  ],
}
const updated = representation(original)
assert.equal(updated.hero.media, 7)
assert.equal(updated.layout[0].blockType, 'facilities')
assert.deepEqual(updated.layout.find((block) => block.blockType === 'gallery')?.images, [7, 8])
assert(!updated.layout.some((block) => ['team', 'services', 'cta'].includes(block.blockType)))
assert(JSON.stringify(updated).includes('Swingground'))
assert(JSON.stringify(updated).includes('Solebox'))
assert(JSON.stringify(updated).includes('Führmaschine'))
assert.deepEqual(representation(updated), updated)
assert.equal(original.layout.length, 2)
assert.deepEqual(representation({ ...original, slug: 'impressum' }), {
  ...original,
  slug: 'impressum',
})
console.log('Representation content checks passed.')
