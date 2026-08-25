import type { SiteInfo } from '@/payload-types'

import { DAYS } from '@/SiteInfo/config'

type Hour = NonNullable<SiteInfo['hours']>[number]
type DayValue = (typeof DAYS)[number][0]

/** "07:00" from a date value (time-only picker stores a full ISO date). */
export const time = (iso: string) =>
  // fixed zone: the server (Vercel) runs in UTC, the stable is in Germany
  new Date(iso).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Berlin' })

/** "Mo – Fr", "Sa, So", "Mo – Mi, Fr" – consecutive days become a range. */
export const dayLabel = (days: DayValue[]) => {
  const idx = days.map((d) => DAYS.findIndex(([v]) => v === d)).sort((a, b) => a - b)
  const groups: number[][] = []
  for (const i of idx) {
    const last = groups[groups.length - 1]
    if (last && i === last[last.length - 1] + 1) last.push(i)
    else groups.push([i])
  }
  return groups
    .map((g) => (g.length > 2 ? `${DAYS[g[0]][2]} – ${DAYS[g[g.length - 1]][2]}` : g.map((i) => DAYS[i][2]).join(', ')))
    .join(', ')
}

export const formatHours = (hours: Hour[]) =>
  hours.map((h) => ({ id: h.id, days: dayLabel(h.days as DayValue[]), time: `${time(h.open)} – ${time(h.close)}` }))

/** schema.org OpeningHoursSpecification entries for LocalBusiness JSON-LD. */
export const openingHoursSpecification = (hours: Hour[]) =>
  hours.map((h) => ({
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: (h.days as DayValue[]).map((d) => DAYS.find(([v]) => v === d)![3]),
    opens: time(h.open),
    closes: time(h.close),
  }))
