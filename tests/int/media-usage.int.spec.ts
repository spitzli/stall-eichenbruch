import { describe, expect, it } from 'vitest'

import type { Page } from '@/payload-types'

import { blockUsage } from '@/collections/Media'

const page = (title: string, layout: Page['layout']) => ({ title, layout }) as Page

describe('blockUsage', () => {
  it('lists pages and block types that reference the media id', () => {
    const pages = [
      page('Startseite', [
        { blockType: 'gallery', images: [1, 2] },
        { blockType: 'mediaBlock', media: 3 },
      ]),
      page('Team', [{ blockType: 'team', heading: 'x', members: [{ name: 'A', photo: 2 }] }]),
      page('Leer', [{ blockType: 'services', heading: 'x', items: [] }]),
    ]
    expect(blockUsage(pages, 2)).toBe('Startseite (Galerie), Team (Team)')
    expect(blockUsage(pages, 3)).toBe('Startseite (Bild)')
    expect(blockUsage(pages, 9)).toBe('–')
  })
})
