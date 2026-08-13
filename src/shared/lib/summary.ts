import type { Item, Member, EventRsvp, FamilyMember, FamilyRsvp } from '../types'
import { calcShareWeights } from './settlement'

export interface SummaryStats {
  actualTotal: number
  boughtCount: number
  enabledCount: number
  pct: number
  perPerson: number | null
  /** Суммарный вес участников (идущие + доли семьи). Используется как делитель «на человека». */
  participantWeight: number
}

export function calcSummary(
  allItems: Item[],
  members: Member[],
  currentEventId: string | null = null,
  rsvp:          EventRsvp[] = [],
  familyMembers: FamilyMember[] = [],
  familyRsvp:    FamilyRsvp[] = [],
): SummaryStats {
  const filtered  = currentEventId ? allItems.filter(i => i.event_id === currentEventId) : allItems
  const enabled   = filtered.filter(i => i.enabled)
  const bought    = enabled.filter(i => i.bought && i.price > 0)
  const actualTotal = bought.reduce((s, i) => s + i.price * i.qty, 0)
  const boughtCount = enabled.filter(i => i.bought).length
  const pct         = enabled.length ? Math.round(boughtCount / enabled.length * 100) : 0

  const { totalWeight } = calcShareWeights(members, currentEventId, rsvp, familyMembers, familyRsvp)

  return {
    actualTotal,
    boughtCount,
    enabledCount: enabled.length,
    pct,
    perPerson: totalWeight > 0 && actualTotal > 0 ? actualTotal / totalWeight : null,
    participantWeight: totalWeight,
  }
}
