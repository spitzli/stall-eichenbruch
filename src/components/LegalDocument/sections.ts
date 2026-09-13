import type { ContentBlock, Page } from '@/payload-types'

type RichTextData = NonNullable<NonNullable<ContentBlock['columns']>[number]['richText']>
type Node = RichTextData['root']['children'][number]

export type LegalSection = { id: string; title: string; data: RichTextData }

function nodeText(node: Node): string {
  if (typeof node.text === 'string') return node.text
  return Array.isArray(node.children) ? (node.children as Node[]).map(nodeText).join('') : ''
}

/** Split existing CMS rich text at h2 headings, without maintaining a second copy of the text.
 * Return null for mixed layouts so the regular block renderer can preserve every CMS block/link.
 */
export function legalSections(blocks: Page['layout']): LegalSection[] | null {
  const sections: LegalSection[] = []
  for (const block of blocks) {
    if (block.blockType !== 'content') return null
    for (const column of block.columns || []) {
      if (column.enableLink) return null
      if (!column.richText) continue
      const data = column.richText
      let title = ''
      let children: Node[] = []
      const append = () => {
        if (!title && children.length === 0) return
        sections.push({
          id: `datenschutz-abschnitt-${sections.length + 1}`,
          title: title || 'Überblick',
          data: { ...data, root: { ...data.root, children } },
        })
      }
      for (const node of data.root.children) {
        if (node.type === 'heading' && node.tag === 'h2') {
          append()
          title = nodeText(node)
          children = []
        } else children.push(node)
      }
      append()
    }
  }
  return sections
}
