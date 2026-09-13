import React from 'react'
import type { Page } from '@/payload-types'
import RichText from '@/components/RichText'
import { RenderBlocks } from '@/blocks/RenderBlocks'
import { RenderHero } from '@/heros/RenderHero'
import { legalSections } from './sections'

/* Hallmark · pre-emit critique: P4 H4 E4 S4 R5 V4
 * Scoped legal-document layout; existing brand tokens and CMS content remain authoritative.
 */
export function LegalDocument({
  hero,
  blocks,
  isDraft,
}: {
  hero: Page['hero']
  blocks: Page['layout']
  isDraft: boolean
}) {
  const sections = legalSections(blocks)
  if (!sections?.length)
    return (
      <>
        <RenderHero {...hero} />
        <RenderBlocks blocks={blocks} />
      </>
    )

  return (
    <div className="container py-8 md:py-14">
      <header className="max-w-3xl pb-10 md:pb-14">
        <p className="mb-5 text-sm text-muted-foreground">Stall Eichenbruch · Rechtliches</p>
        <h1 className="min-w-0 text-4xl leading-tight sm:text-6xl [overflow-wrap:anywhere]">
          {hero.title || 'Datenschutz'}
        </h1>
        {hero.text && (
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            {hero.text}
          </p>
        )}
        {isDraft && (
          <p
            className="mt-6 rounded-xl border border-border bg-card px-5 py-4 text-sm leading-relaxed"
            role="note"
          >
            <strong>Entwurf</strong> – noch nicht veröffentlicht.
          </p>
        )}
      </header>

      <div className="grid min-w-0 gap-10 border-t border-border pt-8 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-16 lg:pt-12">
        <aside className="min-w-0 print:hidden">
          <nav aria-label="Inhaltsverzeichnis Datenschutz" className="lg:sticky lg:top-8">
            <h2 className="mb-4 font-sans text-sm font-medium text-muted-foreground">
              Auf dieser Seite
            </h2>
            <ol className="space-y-1">
              {sections.map((section, index) => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    className="group flex min-w-0 gap-3 rounded-md py-2 text-sm leading-relaxed hover:text-primary"
                  >
                    <span
                      className="w-5 shrink-0 tabular-nums text-muted-foreground"
                      aria-hidden="true"
                    >
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="min-w-0 [overflow-wrap:anywhere] underline-offset-4 group-hover:underline">
                      {section.title}
                    </span>
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </aside>

        <div className="min-w-0 max-w-[70ch]">
          {sections.map((section, index) => (
            <section
              key={section.id}
              id={section.id}
              aria-labelledby={`${section.id}-title`}
              className="scroll-mt-8 border-b border-border pb-10 mb-10 last:border-0 last:mb-0 md:pb-12 md:mb-12"
            >
              <p className="mb-3 text-sm tabular-nums text-muted-foreground" aria-hidden="true">
                {String(index + 1).padStart(2, '0')}
              </p>
              <h2
                id={`${section.id}-title`}
                className="mb-6 text-2xl leading-snug sm:text-3xl [overflow-wrap:anywhere]"
              >
                {section.title}
              </h2>
              <RichText
                data={section.data}
                enableGutter={false}
                className="!text-base sm:!text-lg [overflow-wrap:anywhere] [&_p:first-child]:mt-0"
              />
            </section>
          ))}
          <a href="#" className="text-sm text-primary underline underline-offset-4 print:hidden">
            Zurück nach oben
          </a>
        </div>
      </div>
    </div>
  )
}
