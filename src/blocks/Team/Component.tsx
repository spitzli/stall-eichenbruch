import React from 'react'

import type { TeamBlock as Props } from '@/payload-types'

import { Media } from '@/components/Media'
import { SectionHead } from '@/components/SectionHead'

export const TeamBlock: React.FC<Props> = ({ heading, intro, members }) => (
  <>
    <SectionHead heading={heading} intro={intro} />
    <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {members?.map(({ id, photo, name, role, text }) => (
        <article key={id || name} className="plate">
          {photo && typeof photo === 'object' && (
            <div className="relative aspect-[4/5] overflow-hidden rounded-xl mb-5">
              <Media fill resource={photo} imgClassName="object-cover" size="(min-width: 1024px) 30vw, 50vw" />
            </div>
          )}
          <h3 className="text-2xl">{name}</h3>
          {role && <p className="text-sm text-muted-foreground mt-1">{role}</p>}
          {text && <p className="mt-3 leading-relaxed whitespace-pre-line">{text}</p>}
        </article>
      ))}
    </div>
  </>
)
