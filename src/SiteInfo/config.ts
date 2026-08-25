import type { GlobalConfig } from 'payload'
import { revalidatePath, revalidateTag } from 'next/cache'

/** Weekday value, admin label, short label for the site, schema.org name */
export const DAYS = [
  ['mo', 'Montag', 'Mo', 'Monday'],
  ['tu', 'Dienstag', 'Di', 'Tuesday'],
  ['we', 'Mittwoch', 'Mi', 'Wednesday'],
  ['th', 'Donnerstag', 'Do', 'Thursday'],
  ['fr', 'Freitag', 'Fr', 'Friday'],
  ['sa', 'Samstag', 'Sa', 'Saturday'],
  ['su', 'Sonntag', 'So', 'Sunday'],
] as const

export const SiteInfo: GlobalConfig = {
  slug: 'site-info',
  label: 'Betrieb',
  access: {
    read: () => true,
  },
  admin: {
    description: 'Name, Adresse, Kontakt und Stallzeiten – erscheint im Footer und im Kontakt-Block.',
  },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'name', type: 'text', label: 'Name', required: true, defaultValue: 'Stall Eichenbruch' },
        { name: 'tagline', type: 'text', label: 'Untertitel', admin: { placeholder: 'Pensions- und Ausbildungsstall' } },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'street', type: 'text', label: 'Straße' },
        { name: 'city', type: 'text', label: 'PLZ / Ort' },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'phone', type: 'text', label: 'Telefon' },
        { name: 'mobile', type: 'text', label: 'Mobil' },
        { name: 'email', type: 'email', label: 'E-Mail' },
      ],
    },
    { name: 'mapsUrl', type: 'text', label: 'Link zur Karte (Google Maps o. ä.)' },
    {
      name: 'description',
      type: 'textarea',
      label: 'Kurzbeschreibung',
      admin: { description: 'Ein bis zwei Sätze – Standard-Beschreibung für Google und soziale Netzwerke.' },
    },
    {
      name: 'maintenance',
      type: 'group',
      label: 'Wartungsmodus',
      admin: {
        description:
          'Eingeschaltet zeigt die Website nur noch Titel, Text und Kontakt. Der Admin und die Vorschau für eingeloggte Nutzer bleiben erreichbar.',
      },
      fields: [
        { name: 'enabled', type: 'checkbox', label: 'Wartungsmodus einschalten', defaultValue: false },
        {
          name: 'title',
          type: 'text',
          label: 'Titel',
          defaultValue: 'Wir sind gleich wieder da.',
          admin: { condition: (_, { enabled } = {}) => Boolean(enabled) },
        },
        {
          name: 'text',
          type: 'textarea',
          label: 'Text',
          defaultValue: 'Die Website wird gerade überarbeitet. Sie erreichen uns wie gewohnt per Telefon oder E-Mail.',
          admin: { condition: (_, { enabled } = {}) => Boolean(enabled) },
        },
        {
          name: 'bypassKey',
          type: 'text',
          label: 'Vorschau-Schlüssel',
          // the global is publicly readable – keep the key out of the REST/GraphQL response
          access: { read: ({ req }) => Boolean(req.user) },
          admin: {
            condition: (_, { enabled } = {}) => Boolean(enabled),
            description:
              'Wer den Link https://IHRE-DOMAIN/vorschau?key=SCHLÜSSEL öffnet, sieht die Website trotz Wartungsmodus (30 Tage, pro Browser).',
          },
        },
      ],
    },
    {
      name: 'hours',
      type: 'array',
      label: 'Stallzeiten',
      labels: { singular: 'Zeit', plural: 'Zeiten' },
      fields: [
        {
          name: 'days',
          type: 'select',
          label: 'Wochentage',
          hasMany: true,
          required: true,
          options: DAYS.map(([value, label]) => ({ value, label })),
        },
        {
          type: 'row',
          fields: [
            {
              name: 'open',
              type: 'date',
              label: 'Von',
              required: true,
              admin: { date: { pickerAppearance: 'timeOnly', displayFormat: 'HH:mm', timeFormat: 'HH:mm', timeIntervals: 15 } },
            },
            {
              name: 'close',
              type: 'date',
              label: 'Bis',
              required: true,
              admin: { date: { pickerAppearance: 'timeOnly', displayFormat: 'HH:mm', timeFormat: 'HH:mm', timeIntervals: 15 } },
            },
          ],
        },
      ],
    },
  ],
  hooks: {
    afterChange: [
      ({ doc, req: { context } }) => {
        if (!context.disableRevalidate) {
          revalidateTag('global_site-info', 'max')
          // header, footer, contact block and maintenance mode appear on every page
          revalidatePath('/', 'layout')
        }
        return doc
      },
    ],
  },
}
