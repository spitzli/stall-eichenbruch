/**
 * Development seed: fills the database with the content of Stall Eichenbruch
 * (text from the previous website, photos from ./images).
 * Run with `bun run seed` (uses `payload run`; bun cannot load lexical ESM directly).
 * Destructive – wipes pages, media and forms first.
 */
import { readFile, rm } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { File, Payload, RequiredDataFromCollectionSlug } from 'payload'
import { getPayload } from 'payload'

import config from '../payload.config'

const imagesDir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'images')

type RichText = NonNullable<
  NonNullable<import('../payload-types').ContentBlock['columns']>[number]['richText']
>

const text = (t: string) => ({
  type: 'text',
  version: 1,
  text: t,
  format: 0,
  mode: 'normal',
  style: '',
  detail: 0,
})
const block = (type: 'paragraph' | 'heading', children: unknown[], tag?: string) => ({
  type,
  ...(tag ? { tag } : {}),
  version: 1,
  format: '',
  indent: 0,
  direction: 'ltr',
  children,
})
/** Inline content: "\n" → line break, [label](url) → link, rest → text. */
const inline = (s: string): unknown[] =>
  s.split('\n').flatMap((line, i) => {
    const nodes: unknown[] = i > 0 ? [{ type: 'linebreak', version: 1 }] : []
    for (const part of line.split(/(\[[^\]]+\]\([^)]+\))/)) {
      const m = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/)
      if (m) {
        nodes.push({
          type: 'link',
          version: 3,
          format: '',
          indent: 0,
          direction: 'ltr',
          fields: { linkType: 'custom', url: m[2], newTab: true },
          children: [text(m[1])],
        })
      } else if (part) nodes.push(text(part))
    }
    return nodes
  })
/** Lines starting with "## " become h2, everything else a paragraph. */
const richText = (...lines: string[]): RichText =>
  ({
    root: {
      type: 'root',
      version: 1,
      format: '',
      indent: 0,
      direction: 'ltr',
      children: lines.map((l) =>
        l.startsWith('## ') ? block('heading', [text(l.slice(3))], 'h2') : block('paragraph', inline(l)),
      ),
    },
  }) as unknown as RichText

async function media(payload: Payload, fileName: string, alt: string) {
  const data = await readFile(path.join(imagesDir, fileName))
  const file: File = { name: fileName, data, mimetype: 'image/jpeg', size: data.length }
  return payload.create({ collection: 'media', data: { alt }, file })
}

const link = (page: number, label: string, appearance: 'default' | 'outline' = 'default') => ({
  link: { type: 'reference' as const, reference: { relationTo: 'pages' as const, value: page }, label, appearance },
})
const navLink = (page: number, label: string) => ({
  link: { type: 'reference' as const, reference: { relationTo: 'pages' as const, value: page }, label },
})

async function seed(payload: Payload) {
  // next/cache revalidation is unavailable outside a Next.js request
  const noRevalidate = { disableRevalidate: true }

  payload.logger.info('Clearing content…')
  for (const collection of ['pages', 'media', 'forms', 'form-submissions'] as const) {
    await payload.db.deleteMany({ collection, where: {} })
    if (payload.collections[collection].config.versions) {
      await payload.db.deleteVersions({ collection, where: {} })
    }
  }

  // uploaded files are not removed by db.deleteMany – clear the upload dir so filenames can be reused
  await rm(path.join(imagesDir, '../../../public/media'), { recursive: true, force: true })

  if ((await payload.count({ collection: 'users' })).totalDocs === 0) {
    await payload.create({
      collection: 'users',
      data: { name: 'Admin', email: 'admin@stall-eichenbruch.eu', password: 'password' },
    })
    payload.logger.info('Created user admin@stall-eichenbruch.eu / password')
  }

  payload.logger.info('Uploading images…')
  const [boxWindow, dressageOutdoor, owners, building, hall, dog, paddocks, dressageHall, painting] =
    await Promise.all([
      media(payload, 'header-1.jpg', 'Pferd schaut aus dem Boxenfenster'),
      media(payload, 'header-2.jpg', 'Dressurreiterin auf dem Außenplatz'),
      media(payload, 'header-3.jpg', 'Cora und Günter Mann'),
      media(payload, 'header-4.jpg', 'Stall Eichenbruch – Reit- und Ausbildungszentrum'),
      media(payload, 'header-5.jpg', 'Reithalle 45 × 25 m'),
      media(payload, 'header-6.jpg', 'Hofhund auf der Wiese'),
      media(payload, 'header-7.jpg', 'Boxen mit Paddocks'),
      media(payload, 'header-8.jpg', 'Dressurarbeit in der Reithalle'),
      media(payload, 'header-9.jpg', 'Gemälde: Dressurpferde'),
    ])

  payload.logger.info('Creating contact form…')
  const form = await payload.create({
    collection: 'forms',
    data: {
      title: 'Kontaktformular',
      submitButtonLabel: 'Nachricht senden',
      confirmationType: 'message',
      confirmationMessage: richText('Vielen Dank für Ihre Nachricht. Wir melden uns so schnell wie möglich.'),
      fields: [
        { blockType: 'text', name: 'name', label: 'Name', required: true, width: 100 },
        { blockType: 'email', name: 'email', label: 'E-Mail', required: true, width: 50 },
        { blockType: 'text', name: 'telefon', label: 'Telefon', width: 50 },
        { blockType: 'textarea', name: 'nachricht', label: 'Nachricht', required: true, width: 100, defaultValue: '' },
      ],
    },
  })

  payload.logger.info('Creating pages…')
  const page = (data: RequiredDataFromCollectionSlug<'pages'>) =>
    payload.create({ collection: 'pages', data: { _status: 'published', ...data }, context: noRevalidate })

  const kontakt = await page({
    title: 'Kontakt',
    slug: 'kontakt',
    meta: {
      title: 'Kontakt und Anfahrt – Reitstall in Rastede-Hankhausen',
      description: 'Stall Eichenbruch, Emsoldstraße 40, 26180 Rastede-Hankhausen. Telefon 04402 5956004. Besichtigung nach Absprache – Pension, Reitunterricht und Beritt bei Oldenburg.',
    },
    hero: {
      type: 'text',
      title: 'Kommen Sie vorbei.',
      text: 'Für alle Fragen rund um Pension, Ausbildung und Beritt steht Ihnen Günter Mann zur Verfügung. Rufen Sie an oder schreiben Sie uns.',
    },
    layout: [
      { blockType: 'contact', heading: 'So erreichen Sie uns', text: 'Besichtigungen nach Absprache.' },
      { blockType: 'formBlock', form: form.id, heading: 'Schreiben Sie uns', intro: 'Pensionsplatz, Unterricht, Beritt oder ein Pferd zum Verkauf – wir antworten persönlich.' },
    ],
  })

  const pension = await page({
    title: 'Pension',
    slug: 'pension',
    meta: {
      title: 'Pensionsstall in Rastede – Boxen mit Paddock, 5 ha Weide',
      description: 'Pferdepension bei Oldenburg: 40 helle Boxen (3,50 × 3,50 m), 15 mit Paddock, 6 × wöchentlich entmistet, Heu 2 × und Kraftfutter 3 × täglich, Solarium, Führanlage, 5 ha Weide.',
    },
    hero: {
      type: 'image',
      media: paddocks.id,
      title: '40 Boxen, 15 davon mit Paddock.',
      text: 'Unser vollisolierter Stall bietet großzügige, helle Boxen, komfortable Putz- und Waschplätze mit Solarium und 5 Hektar Weide in bester Qualität.',
      links: [link(kontakt.id, 'Pensionsplatz anfragen')],
    },
    layout: [
      {
        blockType: 'facilities',
        heading: 'Stall und Versorgung',
        intro: 'Die Boxen werden sechsmal wöchentlich entmistet. Kraftfutter (Müsli und Hafer) gibt es dreimal täglich, Heu von hoher Qualität zweimal täglich.',
        items: [
          { label: 'Boxen', value: '40' },
          { label: 'Boxengröße', value: '3,50 × 3,50 m' },
          { label: 'Boxen mit Fenster zur Stallgasse', value: '25' },
          { label: 'Boxen mit Paddock', value: '15' },
          { label: 'Weide', value: '5 ha in 20 Parzellen' },
          { label: 'Entmisten', value: '6 × wöchentlich' },
          { label: 'Kraftfutter', value: '3 × täglich' },
          { label: 'Heu', value: '2 × täglich' },
        ],
      },
      {
        blockType: 'content',
        columns: [
          { size: 'half', richText: richText('## Putz- und Waschplätze', 'Die komfortablen Putz- und Waschplätze sind zusätzlich mit einem Solarium versehen. Die überdachte Führanlage hat einen rutschfesten Gummiboden.') },
          { size: 'half', richText: richText('## Servicepaket', 'Wir bieten ein großes Servicepaket an – vom Weidegang über Longieren bis zum Teil- und Vollberitt. Sprechen Sie uns an, wir stellen es individuell zusammen.') },
        ],
      },
      { blockType: 'gallery', heading: 'Einblicke', images: [boxWindow.id, building.id, hall.id] },
      { blockType: 'cta', heading: 'Ein Platz für Ihr Pferd?', text: 'Wir beraten Sie gerne persönlich und zeigen Ihnen die Anlage.', links: [link(kontakt.id, 'Kontakt aufnehmen')] },
    ],
  })

  const ausbildung = await page({
    title: 'Ausbildung',
    slug: 'ausbildung',
    meta: {
      title: 'Reitunterricht, Beritt und Dressurausbildung in Rastede',
      description: 'Ausbildung von Reitern und Pferden vom Anfänger bis zur Klasse S im Ammerland: individueller Reitunterricht, Teil- und Vollberitt, Korrektur, Turniervorstellung und Verkauf.',
    },
    hero: {
      type: 'image',
      media: dressageOutdoor.id,
      title: 'Vom Anfänger bis zur Klasse S.',
      text: 'Wir bilden Reiter und Pferde individuell aus. Unsere Reitschüler reiten erfolgreich auf Turnieren, Championaten und Deutschen Meisterschaften.',
      links: [link(kontakt.id, 'Unterricht anfragen')],
    },
    layout: [
      {
        blockType: 'services',
        heading: 'Unser Angebot',
        intro: 'Der Reitunterricht wird individuell auf den Reitschüler ausgerichtet – auf dem eigenen Pferd oder auf einem Schulpferd.',
        items: [
          { title: 'Reitunterricht', text: 'Einzel- und Gruppenunterricht für Reiter aller Stufen, vom ersten Sitzschulung bis zur Vorbereitung auf S-Dressuren.' },
          { title: 'Teilberitt', text: 'Ihr Pferd wird an festen Tagen der Woche von uns geritten – ideal, wenn Sie berufstätig sind oder gezielt an einem Thema arbeiten wollen.' },
          { title: 'Vollberitt', text: 'Tägliche Ausbildung Ihres Pferdes durch Cora Mann und unsere Bereiterin, inklusive regelmäßiger Rückmeldung.' },
          { title: 'Korrektur', text: 'Für Pferde, die Probleme mitbringen: Wir arbeiten ruhig und konsequent an einer soliden Grundlage.' },
          { title: 'Turniervorstellung', text: 'Auf Wunsch stellen wir Ihre Pferde auf Turnieren und Championaten vor.' },
          { title: 'Verkauf', text: 'Wir vermitteln ausgebildete Pferde und beraten beim Kauf – ehrlich und mit Blick auf Reiter und Pferd.' },
        ],
      },
      { blockType: 'gallery', heading: 'Aus der Ausbildung', images: [dressageHall.id, hall.id, dressageOutdoor.id] },
      { blockType: 'mediaBlock', media: painting.id },
    ],
  })

  const ueberUns = await page({
    title: 'Wir über uns',
    slug: 'wir-ueber-uns',
    meta: {
      title: 'Cora und Günter Mann – Ausbildungsstall bei Oldenburg',
      description: 'Seit 2009 führen Cora und Günter Mann den Stall Eichenbruch in Rastede. Cora Mann: Trainerlizenz, über 400 Platzierungen bis Klasse S, Pferde bis zur Grand-Prix-Reife ausgebildet.',
    },
    hero: {
      type: 'image',
      media: owners.id,
      title: 'Cora und Günter Mann.',
      text: 'Mehr als 25 Jahre Reitschule und Ausbildungsstall auf hohem Niveau in Hessen – seit 2009 in Rastede-Hankhausen.',
    },
    layout: [
      {
        blockType: 'team',
        heading: 'Wer hier arbeitet',
        intro: 'Ein kleines Team, das jedes Pferd im Stall kennt.',
        members: [
          { name: 'Cora Mann', role: 'Ausbildung, Trainerlizenz', text: 'Bildet seit mehr als 20 Jahren Pferde und Reiter vom Anfänger bis zum Klasse-S-Reiter aus. Über 400 Platzierungen bis zur Klasse S, mehrere Pferde bis zur Grand-Prix-Reife ausgebildet.' },
          { name: 'Günter Mann', role: 'Betrieb, Ansprechpartner', text: 'Für alle anfallenden Fragen rund um Pension, Anlage und Organisation steht Ihnen Günter Mann zur Verfügung.' },
          { name: 'Bereiterin', role: 'Ausbildung', text: 'Das Team wird von einer qualifizierten Bereiterin unterstützt.' },
        ],
      },
      {
        blockType: 'content',
        columns: [
          { size: 'twoThirds', richText: richText('## Ausbildung mit Erfahrung', 'Cora Mann sammelte ihre Erfahrungen bei namhaften Trainern wie Christian Pläge, Thomas Diehl, Hermann Gößmeier, Klaus Balkenhol und Siegfried Peilicke.', 'Der Pensions- und Ausbildungsstall Eichenbruch liegt in direkter Nähe des Schlossparks von Rastede. Direkt neben der Reitanlage beginnt ein tolles Ausreitgelände, in dem Sie mehrere Stunden verbringen können.') },
        ],
      },
      { blockType: 'gallery', heading: 'Rund um den Hof', images: [dog.id, paddocks.id, boxWindow.id] },
    ],
  })

  const impressum = await page({
    title: 'Impressum',
    slug: 'impressum',
    hero: { type: 'text', title: 'Impressum' },
    layout: [
      {
        blockType: 'content',
        columns: [
          {
            size: 'half',
            richText: richText(
              '## Angaben gemäß § 5 DDG',
              'Stall Eichenbruch\nPensions- und Ausbildungsstall\nCora und Günter Mann\nEmsoldstraße 40\n26180 Rastede-Hankhausen',
              '## Kontakt',
              'Telefon: [04402 5956004](tel:044025956004)\nMobil: [01522 8461729](tel:015228461729)\nE-Mail: [post@stall-eichenbruch.eu](mailto:post@stall-eichenbruch.eu)',
              '## Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV',
              'Cora und Günter Mann\nAnschrift wie oben',
            ),
          },
          {
            size: 'half',
            richText: richText(
              '## Haftung für Inhalte',
              'Die Inhalte dieser Website wurden mit größter Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität übernehmen wir jedoch keine Gewähr.',
              '## Haftung für Links',
              'Diese Website enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben. Für diese Inhalte ist stets der jeweilige Anbieter verantwortlich.',
              '## Bildnachweis',
              'Alle Fotos: Stall Eichenbruch.',
              '## Website',
              'Gestaltung und Umsetzung: [Spitzli Development](https://spitzli.dev)',
            ),
          },
        ],
      },
    ],
  })

  const datenschutz = await page({
    title: 'Datenschutzerklärung',
    slug: 'datenschutz',
    hero: { type: 'text', title: 'Datenschutzerklärung' },
    layout: [
      {
        blockType: 'content',
        columns: [
          { size: 'twoThirds', richText: richText('## Verantwortliche Stelle', 'Stall Eichenbruch, Cora und Günter Mann, Emsoldstraße 40, 26180 Rastede-Hankhausen, post@stall-eichenbruch.eu.', '## Kontaktformular', 'Wenn Sie uns über das Kontaktformular schreiben, speichern wir Ihre Angaben zur Bearbeitung der Anfrage. Die Daten werden nicht an Dritte weitergegeben und nach Erledigung gelöscht.', '## Hosting', 'Diese Website wird bei Vercel gehostet. Beim Aufruf werden technisch notwendige Daten (z. B. IP-Adresse, Zeitpunkt, aufgerufene Seite) in Server-Logs verarbeitet.', '## Ihre Rechte', 'Sie haben das Recht auf Auskunft, Berichtigung, Löschung und Einschränkung der Verarbeitung Ihrer Daten. Wenden Sie sich dazu an die oben genannte Adresse.') },
        ],
      },
    ],
  })

  await page({
    title: 'Startseite',
    slug: 'home',
    meta: {
      title: 'Stall Eichenbruch – Pensions- und Ausbildungsstall in Rastede bei Oldenburg',
      description: 'Stall Eichenbruch in Rastede-Hankhausen: 40 Boxen, 15 mit Paddock, Reithalle 45 × 25 m, Reitunterricht bis Klasse S, Beritt, Korrektur und Verkauf. Cora und Günter Mann.',
    },
    hero: {
      type: 'image',
      media: building.id,
      title: 'Pensions- und Ausbildungsstall bei Rastede.',
      text: 'Unterricht, Beritt, Korrektur und Verkauf – auf einer modernen Reitanlage in direkter Nähe des Schlossparks, mit Ausreitgelände vor der Stalltür.',
      links: [link(pension.id, 'Pension'), link(ausbildung.id, 'Ausbildung', 'outline')],
    },
    layout: [
      {
        blockType: 'services',
        heading: 'Was wir anbieten',
        intro: 'Seit mehr als 25 Jahren bilden Cora und Günter Mann Pferde und Reiter aus – und bieten Pensionspferden ein Zuhause.',
        items: [
          { title: 'Pension', text: '40 großzügige, helle Boxen, 15 davon mit Paddock. Sechsmal wöchentlich entmistet, 5 Hektar Weide.' },
          { title: 'Unterricht', text: 'Individuell ausgerichteter Reitunterricht vom Anfänger bis zur Klasse S.' },
          { title: 'Beritt und Korrektur', text: 'Teil- und Vollberitt, Korrektur und auf Wunsch Vorstellung Ihrer Pferde auf Turnieren und Championaten.' },
        ],
      },
      {
        blockType: 'facilities',
        heading: 'Die Anlage',
        intro: 'Beide Plätze verfügen über eine vollautomatische Beregnungsanlage. Die überdachte Führanlage hat einen rutschfesten Gummiboden, der Putz- und Waschplatz ein Solarium.',
        items: [
          { label: 'Reithalle', value: '45 × 25 m' },
          { label: 'Reitplatz', value: '100 × 45 m' },
          { label: 'Dressurviereck', value: '20 × 60 m' },
          { label: 'Rasenspringplatz', value: '80 × 80 m, drainiert' },
          { label: 'Boxen', value: '40, davon 15 mit Paddock' },
          { label: 'Weide', value: '5 ha' },
        ],
      },
      { blockType: 'gallery', images: [hall.id, dressageOutdoor.id, boxWindow.id, paddocks.id, dressageHall.id, dog.id] },
      { blockType: 'contact', heading: 'Kontakt', text: 'Für alle anfallenden Fragen steht Ihnen Günter Mann zur Verfügung.' },
    ],
  })

  payload.logger.info('Updating globals…')
  await payload.updateGlobal({
    slug: 'site-info',
    context: noRevalidate,
    data: {
      name: 'Stall Eichenbruch',
      tagline: 'Pensions- und Ausbildungsstall · Unterricht · Beritt · Korrektur · Verkauf',
      street: 'Emsoldstraße 40',
      city: '26180 Rastede-Hankhausen',
      phone: '04402 5956004',
      mobile: '01522 8461729',
      email: 'post@stall-eichenbruch.eu',
      mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Emsoldstra%C3%9Fe+40+26180+Rastede',
      description:
        'Pensions- und Ausbildungsstall in Rastede-Hankhausen bei Oldenburg: 40 Boxen, 15 mit Paddock, Reithalle 45 × 25 m, Reitunterricht bis Klasse S, Beritt, Korrektur und Verkauf.',
      hours: [],
    },
  })
  await payload.updateGlobal({
    slug: 'header',
    context: noRevalidate,
    data: {
      navItems: [
        navLink(ueberUns.id, 'Wir über uns'),
        navLink(ausbildung.id, 'Ausbildung'),
        navLink(pension.id, 'Pension'),
        navLink(kontakt.id, 'Kontakt'),
      ],
    },
  })
  await payload.updateGlobal({
    slug: 'footer',
    context: noRevalidate,
    data: { navItems: [navLink(impressum.id, 'Impressum'), navLink(datenschutz.id, 'Datenschutzerklärung')] },
  })

  payload.logger.info('Done.')
}

const payload = await getPayload({ config })
await seed(payload)
process.exit(0)
