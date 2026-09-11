import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import sharp from 'sharp'
import { describe, expect, it } from 'vitest'
import { applyPhotoPlacement } from '../../src/seed/photo-placement'
import { representation } from '../../src/seed/representation'
import type { Page } from '../../src/payload-types'
import manifest from '../../docs/photos-manifest.json'

const page: Pick<Page, 'slug' | 'title' | 'hero' | 'layout'> = {
  slug: 'home',
  title: 'Startseite',
  hero: { type: 'image', media: 1 },
  layout: [
    {
      blockType: 'facilities',
      heading: 'Die Anlage',
      items: [{ label: 'Halle', value: '45 × 25 m' }],
    },
    { id: 'existing-gallery', blockType: 'gallery', heading: 'Einblicke', images: [1] },
    { blockType: 'contact', heading: 'Kontakt', text: 'Bestehender Text' },
  ],
}
const ids = Object.fromEntries(manifest.map((photo, i) => [photo.name, i + 10]))

describe('Photo placement', () => {
  it('keeps factual content and block IDs; puts facilities rather than portraits in the gallery', () => {
    const result = applyPhotoPlacement(page, ids)
    expect(result.hero.media).toBe(ids['stall-eichenbruch-gebaeude'])
    expect(result.layout[0]).toEqual(page.layout[0])
    expect(result.layout[2]).toEqual(page.layout[2])
    const gallery = result.layout[1]
    expect(gallery.id).toBe('existing-gallery')
    expect(gallery.blockType === 'gallery' && gallery.images).toEqual([
      ids.reithalle,
      ids.reitplatz,
      ids.longierzelt,
      ids.stallgasse,
      ids.paddockboxen,
      ids['reitplatz-terrasse'],
    ])
    expect(applyPhotoPlacement(result, ids)).toEqual(result)
    expect(page.hero.media).toBe(1)
  })

  it('does not touch legal pages and rejects missing imports before use', () => {
    const legal = { ...page, slug: 'impressum' }
    expect(applyPhotoPlacement(legal, {})).toBe(legal)
    expect(() => applyPhotoPlacement(page, {})).toThrow('Missing imported photo')
  })

  it('representation content is factual and idempotent', () => {
    const result = representation(page)
    expect(result.layout[0].blockType).toBe('facilities')
    expect(JSON.stringify(result)).toContain('Zeltüberdachung')
    expect(JSON.stringify(result)).toContain('Führmaschine')
    expect(
      result.layout.some((block) => ['team', 'services', 'cta'].includes(block.blockType)),
    ).toBe(false)
    expect(representation(result)).toEqual(result)
  })
})

describe('Web assets', () => {
  it('has 18 unchanged originals and valid, metadata-free, source-bounded derivatives', async () => {
    expect(manifest).toHaveLength(18)
    for (const photo of manifest) {
      const original = await readFile(photo.source)
      expect(createHash('sha256').update(original).digest('hex')).toBe(photo.original.sha256)
      for (const file of photo.files) {
        const encoded = await readFile(`public${file.url}`)
        const metadata = await sharp(encoded).metadata()
        expect(encoded.length).toBe(file.bytes)
        expect(metadata.width).toBe(file.width)
        expect(metadata.height).toBe(file.height)
        expect(metadata.exif).toBeUndefined()
        expect(file.width).toBeLessThanOrEqual(photo.original.width)
        expect(file.height).toBeLessThanOrEqual(photo.original.height)
        expect(
          Math.abs(file.width / file.height - photo.original.width / photo.original.height),
        ).toBeLessThan(0.01)
      }
    }
  })
})
