import type { Item, Member } from '../types'

export interface SummaryStats {
  actualTotal: number
  boughtCount: number
  enabledCount: number
  pct: number
  perPerson: number | null
}

export function calcSummary(
  allItems: Item[],
  members: Member[],
  currentEventId: string | null = null,
): SummaryStats {
  const filtered  = currentEventId ? allItems.filter(i => i.event_id === currentEventId) : allItems
  const enabled   = filtered.filter(i => i.enabled)
  const bought    = enabled.filter(i => i.bought && i.price > 0)
  const actualTotal = bought.reduce((s, i) => s + i.price * i.qty, 0)
  const boughtCount = enabled.filter(i => i.bought).length
  const pct         = enabled.length ? Math.round(boughtCount / enabled.length * 100) : 0
  const ppl         = members.length
  return {
    actualTotal,
    boughtCount,
    enabledCount: enabled.length,
    pct,
    perPerson: ppl > 0 && actualTotal > 0 ? actualTotal / ppl : null,
  }
}
