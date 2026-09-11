/** Run: bun run payload run src/seed/update-representation.ts — no deletion or re-upload. */
import { mkdir, writeFile } from 'node:fs/promises'
import { getPayload } from 'payload'
import config from '../payload.config'
import { representation } from './representation'

const payload = await getPayload({ config })
const context = { disableRevalidate: true }
const { docs: pages } = await payload.find({
  collection: 'pages',
  where: { slug: { in: ['home', 'pension', 'ausbildung', 'wir-ueber-uns', 'kontakt'] } },
  depth: 0,
  pagination: false,
})
if (pages.length !== 5) throw new Error('Expected all five content pages; nothing changed.')
const header = await payload.findGlobal({ slug: 'header', depth: 0 })
const site = await payload.findGlobal({ slug: 'site-info', depth: 0 })

// Keep the full previous content outside the repository before changing published pages.
const backup = `/tmp/stall-eichenbruch-${Date.now()}`
await mkdir(backup, { mode: 0o700 })
await writeFile(`${backup}/content.json`, JSON.stringify({ pages, header, site }, null, 2), {
  mode: 0o600,
})
payload.logger.info(`Content backup: ${backup}/content.json`)

for (const page of pages) {
  const { title, hero, layout, meta } = representation(page)
  await payload.update({
    collection: 'pages',
    id: page.id,
    data: { title, hero, layout, meta },
    context,
  })
}
await payload.updateGlobal({
  slug: 'header',
  data: {
    navItems: header.navItems?.map((item) =>
      item.link.label === 'Wir über uns'
        ? { ...item, link: { ...item.link, label: 'Der Stall' } }
        : item,
    ),
  },
  context,
})
await payload.updateGlobal({
  slug: 'site-info',
  data: { tagline: 'Pensions- und Ausbildungsstall in Rastede-Hankhausen' },
  context,
})
payload.logger.info('Content updated. Restart/redeploy Next.js to refresh cached pages.')
process.exit(0)
