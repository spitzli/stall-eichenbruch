import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { privacyDraft } from '../../src/seed/privacy-content'
import { legalSections } from '../../src/components/LegalDocument/sections'

vi.mock('@/components/RichText', () => ({ default: () => <div>CMS text</div> }))
vi.mock('@/blocks/RenderBlocks', () => ({ RenderBlocks: () => <div>Original blocks</div> }))
vi.mock('@/heros/RenderHero', () => ({ RenderHero: () => <h1>Original hero</h1> }))
import { LegalDocument } from '../../src/components/LegalDocument'

describe('Privacy document', () => {
  it('remains a draft and derives its navigation from CMS headings', () => {
    expect(privacyDraft._status).toBe('draft')
    const before = JSON.stringify(privacyDraft.layout)
    const sections = legalSections(privacyDraft.layout)!
    expect(sections).toHaveLength(7)
    expect(new Set(sections.map((section) => section.id)).size).toBe(7)
    expect(sections[0].title).toBe('Verantwortlicher')
    expect(JSON.stringify(sections[0].data)).toContain('mailto:post@stall-eichenbruch.de')
    expect(JSON.stringify(privacyDraft.layout)).toBe(before)
  })

  it('also handles several headings in the previous single CMS content block', () => {
    const first = privacyDraft.layout[0]
    const second = privacyDraft.layout[1]
    if (first.blockType !== 'content' || second.blockType !== 'content') throw new Error('Fixture')
    const data = first.columns![0].richText!
    const extra = second.columns![0].richText!
    const sections = legalSections([
      {
        ...first,
        columns: [
          {
            size: 'full',
            richText: {
              ...data,
              root: { ...data.root, children: [...data.root.children, ...extra.root.children] },
            },
          },
        ],
      },
    ])!
    expect(sections.map((section) => section.title)).toEqual([
      'Verantwortlicher',
      'Website und Hosting',
    ])
    expect(sections[0].data.root.children).toEqual(data.root.children.slice(1))
    expect(sections[1].data.root.children).toEqual(extra.root.children.slice(1))
  })

  it('keeps the visitor text concise without hiding integrations or adding review instructions', () => {
    const readText = (value: unknown): string => {
      if (!value || typeof value !== 'object') return ''
      const node = value as { text?: unknown; children?: unknown[] }
      return typeof node.text === 'string'
        ? node.text
        : node.children?.map(readText).join(' ') || ''
    }
    const body = legalSections(privacyDraft.layout)!
      .map((section) => readText(section.data.root))
      .join(' ')
    expect(body.split(/\s+/).length).toBeLessThan(650)
    for (const term of [
      'Spitzli Development',
      'Vercel',
      'Neon',
      'USA',
      'Web Analytics',
      'Speed Insights',
      'Art. 6',
      'Art. 21',
      'Art. 77',
    ]) {
      expect(body).toContain(term)
    }
    expect(body).not.toMatch(
      /vor Veröffentlichung|zu prüfen|zu klären|AV-Vertrag|abschließend.*bestätigen/,
    )
  })

  it('does not silently discard non-text blocks or attached CMS links', () => {
    expect(legalSections([{ blockType: 'gallery', images: [] }])).toBeNull()
    expect(legalSections([{ blockType: 'content', columns: [{ enableLink: true }] }])).toBeNull()
  })

  it('renders working anchor targets, a single h1 and a visible review notice for drafts', () => {
    const html = renderToStaticMarkup(
      <LegalDocument hero={privacyDraft.hero} blocks={privacyDraft.layout} isDraft />,
    )
    const doc = new DOMParser().parseFromString(html, 'text/html')
    expect(doc.querySelectorAll('h1')).toHaveLength(1)
    expect(doc.querySelector('[role="note"]')?.textContent).toContain('Entwurf')
    const links = [...doc.querySelectorAll('nav a')]
    expect(links).toHaveLength(7)
    for (const link of links) expect(doc.querySelector(link.getAttribute('href')!)).not.toBeNull()
    const published = renderToStaticMarkup(
      <LegalDocument hero={privacyDraft.hero} blocks={privacyDraft.layout} isDraft={false} />,
    )
    expect(published).not.toContain('noch nicht veröffentlicht')
  })
})
