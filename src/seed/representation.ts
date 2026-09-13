import type { Page } from '../payload-types'
import { applyOwnerCorrections } from './owner-corrections'

type Content = Pick<Page, 'slug' | 'title' | 'hero' | 'layout' | 'meta'>

const facilities: Page['layout'][number] = {
  blockType: 'facilities',
  heading: 'Die Anlage',
  intro: 'Stall Eichenbruch in Rastede-Hankhausen, in direkter Nähe des Schlossparks.',
  items: [
    { label: 'Reithalle', value: '45 × 25 m' },
    { label: 'Reitplatz', value: '100 × 45 m' },
    { label: 'Dressurviereck', value: '20 × 60 m' },
    { label: 'Rasenspringplatz', value: '80 × 80 m, drainiert' },
    { label: 'Longierhalle', value: 'Mit Swingground' },
    { label: 'Führmaschine', value: 'Überdacht, Gummiboden' },
    { label: 'Boxen', value: '40, davon 15 mit Paddock' },
    { label: 'Weiden', value: '5 ha in 20 Parzellen' },
    { label: 'Putz- und Waschplätze', value: 'Mit Solarium' },
    { label: 'Beregnung', value: 'Beide Reitplätze, vollautomatisch' },
  ],
}

function baseRepresentation(page: Content): Content {
  const gallery = page.layout.filter((block) => block.blockType === 'gallery')
  switch (page.slug) {
    case 'home':
      return {
        ...page,
        hero: {
          ...page.hero,
          title: 'Stall Eichenbruch.',
          links: [],
        },
        layout: [
          facilities,
          ...gallery.map((block) => ({ ...block, heading: 'Einblicke in die Anlage' })),
          {
            blockType: 'contact',
            heading: 'Kontakt und Lage',
            text: 'Emsoldstraße 40 · Rastede-Hankhausen. Ansprechpartner: Günter Mann.',
          },
        ],
      }
    case 'pension':
      return {
        ...page,
        hero: {
          ...page.hero,
          links: [],
        },
        layout: [
          ...page.layout
            .filter((block) => block.blockType === 'facilities')
            .map((block) => ({
              ...block,
              intro:
                'Die Boxen werden sechsmal wöchentlich entmistet. Kraftfutter (Müsli und Hafer) dreimal täglich, Heu zweimal täglich.',
            })),
          ...gallery,
        ],
      }
    case 'wir-ueber-uns':
      return {
        ...page,
        title: 'Der Stall',
        meta: {
          ...page.meta,
          title: 'Stall Eichenbruch – Anlage in Rastede-Hankhausen',
        },
        hero: {
          ...page.hero,
          title: 'Der Stall in Rastede-Hankhausen.',
          text: 'Cora und Günter Mann führen den Stall Eichenbruch seit 2009. Die Anlage liegt in der Nähe des Schlossparks; das Ausreitgelände beginnt direkt neben dem Hof.',
          links: [],
        },
        layout: [facilities, ...gallery],
      }
    case 'kontakt':
      return {
        ...page,
        meta: {
          ...page.meta,
          description:
            'Adresse und Kontakt: Stall Eichenbruch, Emsoldstraße 40, 26180 Rastede-Hankhausen. Telefon 04402 5956004. Ansprechpartner: Günter Mann.',
        },
        hero: {
          ...page.hero,
          title: 'Kontakt und Anfahrt.',
          text: 'Stall Eichenbruch · Emsoldstraße 40 · 26180 Rastede-Hankhausen. Ansprechpartner: Günter Mann.',
          links: [],
        },
        layout: page.layout.map((block) =>
          block.blockType === 'formBlock' ? { ...block, heading: 'Nachricht', intro: null } : block,
        ),
      }
    default:
      return page
  }
}

/** Shared by initial seed and content updates; subsequent owner corrections stay consistent. */
export function representation(page: Content): Content {
  return applyOwnerCorrections(baseRepresentation(page))
}
