import React from 'react'

type Props = {
  heading?: string | null
  intro?: string | null
  as?: 'h1' | 'h2'
}

/** Heading left, intro right – shared head for every section. */
export const SectionHead: React.FC<Props> = ({ heading, intro, as: Tag = 'h2' }) => {
  if (!heading && !intro) return null
  return (
    <div className="grid gap-4 md:grid-cols-12 md:gap-8 items-end">
      {heading && <Tag className="text-3xl md:text-4xl md:col-span-5">{heading}</Tag>}
      {intro && (
        <p className="text-lg text-muted-foreground leading-relaxed md:col-span-6 md:col-start-7 whitespace-pre-line">
          {intro}
        </p>
      )}
    </div>
  )
}
