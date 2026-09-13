import { describe, expect, it } from 'vitest'
import { readFile } from 'node:fs/promises'
import sharp from 'sharp'
import type { Media, Page } from '../../src/payload-types'
import {
  applyOwnerCorrections,
  appendWalkerPhoto,
  findWalkerPhoto,
  walkerPlaceholderFilename,
} from '../../src/seed/owner-corrections'

const page: Pick<Page, 'slug' | 'title' | 'hero' | 'layout' | 'meta'> = {
  slug: 'home',
  title: 'Startseite',
  hero: { type: 'image', media: 7 },
  meta: { image: 8 },
  layout: [
    {
      id: 'facts',
      blockType: 'facilities',
      heading: 'Die Anlage',
      items: [
        { id: 'longier', label: 'Longierplatz', value: 'Mit Zeltüberdachung' },
        { id: 'unchanged', label: 'Weitere Ausstattung', value: 'Bestehende Angabe' },
      ],
    },
    { id: 'photos', blockType: 'gallery', images: [1, 2] },
    { id: 'contact', blockType: 'contact', heading: 'Kontakt', text: 'Bestehender Kontakttext' },
  ],
}

describe('Owner-confirmed facility corrections', () => {
  it('updates only the confirmed rows and adds the placeholder once without dropping photos', () => {
    const result = applyOwnerCorrections(page, 99)
    const facts = result.layout[0]
    if (facts.blockType !== 'facilities') throw new Error('Wrong block')
    expect(facts.id).toBe('facts')
    expect(facts.items).toContainEqual({
      id: 'longier',
      label: 'Longierhalle',
      value: 'Mit Swingground',
    })
    expect(facts.items).toContainEqual({
      id: 'unchanged',
      label: 'Weitere Ausstattung',
      value: 'Bestehende Angabe',
    })
    expect(facts.items?.filter((item) => item.label === 'Solebox')).toHaveLength(1)
    expect(result.layout[1]).toEqual({ id: 'photos', blockType: 'gallery', images: [1, 2, 99] })
    expect(result.layout[2]).toEqual(page.layout[2])
    expect(result.hero.media).toBe(7)
    expect(result.meta?.image).toBe(8)
    expect(applyOwnerCorrections(result, 99)).toEqual(result)
    expect(page.layout[1]).toEqual({ id: 'photos', blockType: 'gallery', images: [1, 2] })
  })

  it('replaces the training offer with own-horse copy and retains unrelated blocks', () => {
    const extraService = {
      blockType: 'services' as const,
      heading: 'Weitere Hinweise',
      items: [{ title: 'Hinweis', text: 'Unverändert' }],
    }
    const training = {
      ...page,
      slug: 'ausbildung',
      layout: [
        {
          blockType: 'services' as const,
          heading: 'Ausbildung und Beritt',
          intro: 'Auf einem Schulpferd',
          items: [{ title: 'Unterricht', text: 'Bis Klasse S' }],
        },
        page.layout[1],
        extraService,
      ],
    }
    const result = applyOwnerCorrections(training, 99)
    expect(result.hero.title).toBe('Ausbildung und Beritt.')
    expect(result.hero.text).toContain('Pferd und Reiter')
    expect(result.hero.text).toContain('mit dem eigenen Pferd')
    expect(result.hero.text).toContain('Schulpferde stehen nicht zur Verfügung')
    expect(result.layout).toEqual([page.layout[1], extraService])
    expect(JSON.stringify(result)).not.toContain('Klasse S')
    expect(JSON.stringify(result)).not.toContain('Auf einem Schulpferd')
  })

  it('does not alter legal drafts or add walker photos to unrelated pages', () => {
    const legal = { ...page, slug: 'datenschutz' }
    expect(applyOwnerCorrections(legal, 99)).toBe(legal)
    expect(appendWalkerPhoto({ ...page, slug: 'pension' }, 99).layout).toBe(page.layout)
  })

  it('reuses a real replacement rather than reinstating the placeholder', () => {
    const placeholder = {
      id: 99,
      filename: walkerPlaceholderFilename,
      alt: 'Führmaschine – Foto folgt',
    } as Media
    const real = { id: 100, filename: 'neues-foto.webp', alt: 'Überdachte Führmaschine' } as Media
    expect(findWalkerPhoto([placeholder, real])).toBe(real)
    const populated = { ...page, layout: [{ blockType: 'gallery' as const, images: [real] }] }
    expect(appendWalkerPhoto(populated, real.id).layout).toEqual(populated.layout)
  })

  it('provides a clearly labelled, metadata-free 4:3 image placeholder', async () => {
    const svg = await readFile('assets/placeholders/fuehrmaschine.svg', 'utf8')
    expect(svg).toContain('Foto folgt')
    const image = await sharp(`public/images/stall/${walkerPlaceholderFilename}`).metadata()
    expect(image.width).toBe(1200)
    expect(image.height).toBe(900)
    expect(image.exif).toBeUndefined()
  })
})
