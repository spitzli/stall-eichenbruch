import type { Media, Page } from '../payload-types'

type Content = Pick<Page, 'slug' | 'title' | 'hero' | 'layout' | 'meta'>

export const trainingTitle = 'Ausbildung und Beritt.'
export const trainingText =
  'Pferd und Reiter werden ausgebildet – ausschließlich mit dem eigenen Pferd. Schulpferde stehen nicht zur Verfügung.'
export const longierPhotoAlt =
  'Longierhalle mit Swingground, einem Pferd und zwei Personen unter dem Zeltdach'
export const walkerPlaceholderFilename = 'fuehrmaschine-platzhalter.webp'
export const walkerPlaceholderAlt = 'Führmaschine – Fotoplatzhalter. Foto folgt.'

// A real replacement with an updated filename remains usable; never overwrite it with a placeholder.
export function findWalkerPhoto(media: Media[]): Media | undefined {
  return (
    media.find(
      (item) =>
        item.filename !== walkerPlaceholderFilename &&
        /Führmaschine|Führanlage/i.test(item.alt || ''),
    ) || media.find((item) => item.filename === walkerPlaceholderFilename)
  )
}

export function appendWalkerPhoto<T extends Pick<Page, 'slug' | 'layout'>>(
  page: T,
  mediaId?: number,
): T {
  if (!mediaId || !['home', 'wir-ueber-uns'].includes(page.slug || '')) return page
  return {
    ...page,
    layout: page.layout.map((block) =>
      block.blockType === 'gallery' &&
      !block.images.some((image) => (typeof image === 'object' ? image.id : image) === mediaId)
        ? { ...block, images: [...block.images, mediaId] }
        : block,
    ),
  }
}

/** Owner-confirmed corrections only. Preserve all unrelated blocks, photos, row IDs and legal drafts. */
export function applyOwnerCorrections<T extends Content>(page: T, placeholderId?: number): T {
  if (!['home', 'pension', 'wir-ueber-uns', 'ausbildung'].includes(page.slug || '')) return page

  const hero = { ...page.hero }
  const meta = { ...page.meta }
  if (page.slug === 'home') {
    hero.text =
      'Pensions- und Ausbildungsstall in Rastede-Hankhausen. Reithalle, Außenplätze, Longierhalle mit Swingground, Führmaschine, Solebox und Weiden.'
    meta.description =
      'Stall Eichenbruch in Rastede-Hankhausen: Reithalle, Außenplätze, Longierhalle mit Swingground, überdachte Führmaschine, Solebox, 40 Boxen und 5 ha Weiden.'
  } else if (page.slug === 'wir-ueber-uns') {
    meta.description =
      'Cora und Günter Mann führen den Stall Eichenbruch seit 2009 in Rastede-Hankhausen. Reithalle, Plätze, Longierhalle mit Swingground, Führmaschine, Solebox und Weiden.'
  } else if (page.slug === 'pension') {
    hero.text =
      'Vollisolierter Stall mit 40 Boxen, davon 15 mit Paddock. Dazu Putz- und Waschplätze mit Solarium, eine Solebox sowie 5 Hektar Weiden.'
    meta.description = meta.description?.replace(
      'Solarium, Führanlage',
      'Solarium, Solebox, Führmaschine',
    )
  } else {
    hero.title = trainingTitle
    hero.text = trainingText
    hero.links = []
    meta.title = 'Ausbildung und Beritt in Rastede – mit dem eigenen Pferd'
    meta.description =
      'Ausbildung von Pferd und Reiter bei Stall Eichenbruch in Rastede. Ausbildung und Beritt ausschließlich mit eigenen Pferden; keine Schulpferde.'
  }

  const layout = page.layout
    // The requested short statement replaces the previous offer cards; the gallery stays.
    .filter(
      (block) =>
        !(
          page.slug === 'ausbildung' &&
          block.blockType === 'services' &&
          ['Ausbildung und Beritt', 'Unser Angebot'].includes(block.heading)
        ),
    )
    .map((block) => {
      if (block.blockType === 'facilities') {
        const items = (block.items || []).map((item) =>
          /^(Longierplatz|Longierzelt|Longierhalle)$/i.test(item.label.trim())
            ? { ...item, label: 'Longierhalle', value: 'Mit Swingground' }
            : item,
        )
        if (!items.some((item) => item.label.trim().toLowerCase() === 'solebox')) {
          items.push({ label: 'Solebox', value: 'Vorhanden' })
        }
        return { ...block, items }
      }
      return block
    })

  return appendWalkerPhoto({ ...page, hero, meta, layout }, placeholderId)
}
