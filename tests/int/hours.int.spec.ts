import { describe, expect, it } from 'vitest'

import { dayLabel, formatHours } from '@/utilities/hours'

describe('hours', () => {
  it('compresses consecutive days into ranges', () => {
    expect(dayLabel(['mo', 'tu', 'we', 'th', 'fr'])).toBe('Mo – Fr')
    expect(dayLabel(['sa', 'su'])).toBe('Sa, So')
    expect(dayLabel(['fr', 'mo', 'we', 'tu'])).toBe('Mo – Mi, Fr')
    expect(dayLabel(['su'])).toBe('So')
  })

  it('formats times in 24h', () => {
    const [row] = formatHours([
      { days: ['mo'], open: '2026-01-01T07:00:00.000+01:00', close: '2026-01-01T21:30:00.000+01:00' },
    ])
    expect(row.time).toBe('07:00 – 21:30')
  })
})
