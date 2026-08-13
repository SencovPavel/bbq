import type { Item, Member, EventRsvp, FamilyMember, FamilyRsvp } from '../types'

export interface Transfer {
  fromId:   string
  fromName: string
  toId:     string
  toName:   string
  amount:   number  // округлено до рублей
}

export interface SettlementResult {
  total:     number
  perPerson: number
  transfers: Transfer[]
}

const EPS = 0.005 // меньше половины копейки — считаем нулём

/**
 * Взвешенные доли участников для расчётов.
 *
 * Правила:
 * - участник группы получает долю 1.0, если он идёт на событие
 *   (RSVP attending; по умолчанию — идёт, если записи нет);
 * - член семьи добавляет долю пропорционально cost_pct (в процентах),
 *   если include_in_calc === true и он идёт на событие (familyRsvp);
 *   эта доля приписывается его владельцу (owner_id);
 * - если eventId === null, RSVP не применяется — все считаются идущими.
 *
 * Без данных RSVP/семьи вырождается в вес 1.0 на каждого участника,
 * т.е. totalWeight === members.length (обратная совместимость).
 */
export interface ShareWeights {
  weightByMember: Map<string, number>
  totalWeight:    number
}

export function calcShareWeights(
  members:       Member[],
  eventId:       string | null = null,
  rsvp:          EventRsvp[] = [],
  familyMembers: FamilyMember[] = [],
  familyRsvp:    FamilyRsvp[] = [],
): ShareWeights {
  const memberAttending = (userId: string): boolean => {
    if (!eventId) return true
    const e = rsvp.find(r => r.event_id === eventId && r.user_id === userId)
    return e ? e.attending : true
  }
  const familyAttending = (familyMemberId: string): boolean => {
    if (!eventId) return true
    const e = familyRsvp.find(r => r.family_member_id === familyMemberId && r.event_id === eventId)
    return e ? e.attending : true
  }

  const weightByMember = new Map<string, number>()
  for (const m of members) {
    weightByMember.set(m.user_id, memberAttending(m.user_id) ? 1 : 0)
  }

  for (const fm of familyMembers) {
    if (fm.include_in_calc !== true) continue
    if (!weightByMember.has(fm.owner_id)) continue // владелец должен быть участником группы
    if (!familyAttending(fm.id)) continue
    const w = (fm.cost_pct ?? 0) / 100
    if (w <= 0) continue
    weightByMember.set(fm.owner_id, (weightByMember.get(fm.owner_id) ?? 0) + w)
  }

  let totalWeight = 0
  for (const w of weightByMember.values()) totalWeight += w

  return { weightByMember, totalWeight }
}

/**
 * Рассчитывает минимальный список переводов для расчёта долгов.
 *
 * Алгоритм:
 * 1. Считаем кто сколько заплатил (buyer_id на купленных позициях).
 * 2. Справедливая доля участника = его вес × (total / totalWeight),
 *    где вес учитывает RSVP «не иду» и членов семьи (см. calcShareWeights).
 * 3. Баланс = заплатил − доля (>0 — ему должны, <0 — он должен).
 * 4. Жадно сопоставляем крупнейшего кредитора с крупнейшим должником.
 */
export function calcSettlement(
  items:         Item[],
  members:       Member[],
  eventId:       string | null = null,
  rsvp:          EventRsvp[] = [],
  familyMembers: FamilyMember[] = [],
  familyRsvp:    FamilyRsvp[] = [],
): SettlementResult {
  if (!members.length) return { total: 0, perPerson: 0, transfers: [] }

  const scoped = eventId ? items.filter(i => i.event_id === eventId) : items
  const bought  = scoped.filter(i => i.enabled && i.bought && i.price > 0)

  const total = bought.reduce((s, i) => s + i.price * i.qty, 0)

  const { weightByMember, totalWeight } = calcShareWeights(
    members, eventId, rsvp, familyMembers, familyRsvp,
  )
  const perPerson = totalWeight > 0 ? total / totalWeight : 0

  // Сколько каждый участник заплатил
  const paid = new Map<string, number>(members.map(m => [m.user_id, 0]))
  for (const it of bought) {
    if (it.buyer_id) paid.set(it.buyer_id, (paid.get(it.buyer_id) ?? 0) + it.price * it.qty)
  }

  // Баланс каждого (доля пропорциональна весу)
  const balances = members.map(m => ({
    id:      m.user_id,
    name:    m.name,
    balance: (paid.get(m.user_id) ?? 0) - (weightByMember.get(m.user_id) ?? 0) * perPerson,
  }))

  const creditors = balances.filter(b => b.balance >  EPS).sort((a, b) => b.balance - a.balance)
  const debtors   = balances.filter(b => b.balance < -EPS).sort((a, b) => a.balance - b.balance)

  const transfers: Transfer[] = []
  let ci = 0, di = 0

  while (ci < creditors.length && di < debtors.length) {
    const c = creditors[ci]
    const d = debtors[di]
    const amount = Math.min(c.balance, -d.balance)

    if (amount >= 0.5) {
      transfers.push({
        fromId:   d.id,
        fromName: d.name,
        toId:     c.id,
        toName:   c.name,
        amount:   Math.round(amount),
      })
    }

    c.balance -= amount
    d.balance += amount

    if (Math.abs(c.balance) < EPS) ci++
    if (Math.abs(d.balance) < EPS) di++
  }

  return { total, perPerson, transfers }
}
