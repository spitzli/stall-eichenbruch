import type { GlobalConfig } from 'payload'
import { revalidateTag } from 'next/cache'

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
      name: 'hours',
      type: 'array',
      label: 'Stallzeiten',
      labels: { singular: 'Zeit', plural: 'Zeiten' },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'label', type: 'text', label: 'Tag(e)', required: true },
            { name: 'value', type: 'text', label: 'Zeit', required: true },
          ],
        },
      ],
    },
  ],
  hooks: {
    afterChange: [
      ({ doc, req: { context } }) => {
        if (!context.disableRevalidate) revalidateTag('global_site-info', 'max')
        return doc
      },
    ],
  },
}
