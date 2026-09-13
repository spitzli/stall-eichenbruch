import type { ContentBlock, Page } from '../payload-types'

type RichText = NonNullable<NonNullable<ContentBlock['columns']>[number]['richText']>
const text = (value: string) => ({
  type: 'text',
  version: 1,
  text: value,
  format: 0,
  mode: 'normal',
  style: '',
  detail: 0,
})
const inline = (value: string): unknown[] =>
  value.split('\n').flatMap((line, index) => [
    ...(index ? [{ type: 'linebreak', version: 1 }] : []),
    ...line
      .split(/(\[[^\]]+\]\([^)]+\))/)
      .filter(Boolean)
      .map((part) => {
        const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/)
        return link
          ? {
              type: 'link',
              version: 3,
              format: '',
              indent: 0,
              direction: 'ltr',
              fields: { linkType: 'custom', url: link[2], newTab: false },
              children: [text(link[1])],
            }
          : text(part)
      }),
  ])
const section = (title: string, ...paragraphs: string[]): ContentBlock => ({
  blockType: 'content',
  columns: [
    {
      size: 'full',
      richText: {
        root: {
          type: 'root',
          version: 1,
          format: '',
          indent: 0,
          direction: 'ltr',
          children: [
            {
              type: 'heading',
              tag: 'h2',
              version: 1,
              format: '',
              indent: 0,
              direction: 'ltr',
              children: [text(title)],
            },
            ...paragraphs.map((paragraph) => ({
              type: 'paragraph',
              version: 1,
              format: '',
              indent: 0,
              direction: 'ltr',
              children: inline(paragraph),
            })),
          ],
        },
      } as RichText,
    },
  ],
})

/** Editorial draft, not a legal compliance certification. Never auto-publish; see docs/privacy-review.md. */
export const privacyDraft: Pick<Page, 'title' | 'hero' | 'layout' | 'meta' | '_status'> = {
  title: 'Datenschutzerklärung',
  _status: 'draft',
  hero: {
    type: 'text',
    title: 'Datenschutz',
    text: 'Informationen zum Umgang mit personenbezogenen Daten beim Besuch dieser Website und bei der Kontaktaufnahme.',
    links: [],
  },
  meta: {
    title: 'Datenschutzerklärung – Stall Eichenbruch',
    description:
      'Informationen zu Verantwortlichkeit, technischem Betrieb, Kontaktanfragen und Ihren Datenschutzrechten bei Stall Eichenbruch.',
  },
  layout: [
    section(
      'Verantwortlicher',
      'Stall Eichenbruch\nCora und Günter Mann\nEmsoldstraße 40\n26180 Rastede-Hankhausen',
      'E-Mail: [post@stall-eichenbruch.de](mailto:post@stall-eichenbruch.de)\nTelefon: [04402 5956004](tel:+4944025956004)',
    ),
    section(
      'Website und Hosting',
      'Beim Seitenaufruf werden IP-Adresse, Zeitpunkt, angefragte Adresse sowie Browser- und Betriebssystemangaben verarbeitet. Dies dient der Auslieferung, Sicherheit und Fehlerbehebung der Website. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO; unser berechtigtes Interesse ist ein sicherer, funktionsfähiger Internetauftritt.',
      'Die technische Betreuung übernimmt [Spitzli Development](https://spitzli.dev). Für Hosting und Dateispeicherung nutzen wir [Vercel](https://vercel.com/legal/privacy-notice), für die Datenbank [Neon](https://neon.com/dpa). Diese Dienstleister können im Rahmen ihrer Aufgaben Zugriff auf personenbezogene Daten erhalten. Bei den internationalen Anbietern sind Verarbeitungen oder Zugriffe außerhalb der EU und des EWR, insbesondere in den USA, möglich.',
    ),
    section(
      'Kontaktanfragen',
      'Bei Kontakt per Formular, E-Mail oder Telefon verarbeiten wir Ihre Angaben zur Beantwortung Ihrer Anfrage. Im Formular werden Name, E-Mail-Adresse und Nachricht erfasst; die Telefonnummer ist freiwillig. Formularanfragen werden in unserer Website-Datenbank gespeichert. Ohne erforderliche Kontaktdaten können wir gegebenenfalls nicht antworten.',
      'Rechtsgrundlage ist bei vertragsbezogenen Anfragen Art. 6 Abs. 1 lit. b DSGVO. Andere Anfragen bearbeiten wir nach Art. 6 Abs. 1 lit. f DSGVO aufgrund unseres berechtigten Interesses an der Kommunikation mit Ihnen.',
    ),
    section(
      'Statistik und Ladezeiten',
      'Vercel Web Analytics und Speed Insights sind zur Auswertung der Website-Nutzung und Ladezeiten eingebunden. Dabei können Seitenadressen, verweisende Seiten, Geräte- und Browserangaben, abgeleitete Standortangaben sowie technische Leistungswerte verarbeitet werden.',
      'Informationen zu den Messdiensten: [Vercel Web Analytics](https://vercel.com/docs/analytics/privacy-policy) und [Speed Insights](https://vercel.com/docs/speed-insights/privacy-policy).',
    ),
    section(
      'Cookies und externe Links',
      'Für die Anmeldung im Verwaltungsbereich und den aufgerufenen Vorschauzugang werden notwendige Cookies verwendet. Sie ermöglichen die jeweils angeforderte Funktion (§ 25 Abs. 2 Nr. 2 TDDDG). Die zugehörige Datenverarbeitung dient dem sicheren Betrieb nach Art. 6 Abs. 1 lit. f DSGVO.',
      'Schriftarten werden über diese Website ausgeliefert. Google Maps ist nur verlinkt, nicht eingebettet. Beim Öffnen externer Links gelten die Datenschutzinformationen der Zielseite.',
    ),
    section(
      'Speicherdauer',
      'Die Aufbewahrung richtet sich nach dem Verarbeitungszweck. Maßgeblich sind die Bearbeitung Ihrer Anfrage, gegebenenfalls anschließende Vertragsbeziehungen und gesetzliche Aufbewahrungspflichten. Bei technischen Protokollen und Sicherungskopien sind insbesondere der sichere Betrieb, die Fehlerbehebung und die Aufklärung von Sicherheitsvorfällen ausschlaggebend.',
    ),
    section(
      'Ihre Rechte',
      'Unter den gesetzlichen Voraussetzungen haben Sie Rechte auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung und Datenübertragbarkeit (Art. 15–20 DSGVO). Eine erteilte Einwilligung können Sie jederzeit für die Zukunft widerrufen; die Rechtmäßigkeit der bisherigen Verarbeitung bleibt davon unberührt.',
      'Gegen eine Verarbeitung auf Grundlage berechtigter Interessen können Sie aus Gründen Ihrer besonderen Situation widersprechen (Art. 21 DSGVO). Gegen Direktwerbung ist ein Widerspruch jederzeit möglich. Wenden Sie sich dafür an [post@stall-eichenbruch.de](mailto:post@stall-eichenbruch.de).',
      'Sie können sich außerdem bei einer Datenschutzaufsichtsbehörde beschweren (Art. 77 DSGVO), etwa bei der Behörde Ihres Aufenthaltsorts oder beim [Landesbeauftragten für den Datenschutz Niedersachsen](https://www.lfd.niedersachsen.de/beschwerde/beschwerdeformular-191364.html).',
    ),
  ],
}
