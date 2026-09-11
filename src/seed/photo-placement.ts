import type { Page } from '../payload-types'

const placements: Record<string, { hero: string; gallery: string[] }> = {
  home: {
    hero: 'stall-eichenbruch-gebaeude',
    gallery: [
      'reithalle',
      'reitplatz',
      'longierzelt',
      'stallgasse',
      'paddockboxen',
      'reitplatz-terrasse',
    ],
  },
  pension: {
    hero: 'paddockboxen',
    gallery: ['stallgasse', 'boxenfenster', 'paddockboxen', 'stallgasse-hochformat'],
  },
  'wir-ueber-uns': {
    hero: 'reitplatz-terrasse',
    gallery: ['reithalle', 'reitplatz', 'longierzelt', 'paddockboxen'],
  },
  ausbildung: {
    hero: 'dressur-aussenplatz',
    gallery: ['dressur-reithalle', 'reithalle', 'dressur-aussenplatz'],
  },
}

/** Retain copy, block IDs and unrelated content; only replace the selected image slots. */
export function applyPhotoPlacement<T extends Pick<Page, 'slug' | 'hero' | 'layout' | 'meta'>>(
  page: T,
  ids: Record<string, number>,
): T {
  const placement = placements[page.slug || '']
  if (!placement) return page
  const image = (name: string) => {
    if (!ids[name]) throw new Error(`Missing imported photo: ${name}`)
    return ids[name]
  }
  const gallery = placement.gallery.map(image)
  const hero = image(placement.hero)
  return {
    ...page,
    hero: { ...page.hero, media: hero },
    meta: { ...page.meta, image: hero },
    layout: page.layout.map((block) =>
      block.blockType === 'gallery' ? { ...block, images: gallery } : block,
    ),
  }
}
