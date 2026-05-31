import type { Item, Member } from '../types'

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
 * Рассчитывает минимальный список переводов для расчёта долгов.
 *
 * Алгоритм:
 * 1. Считаем кто сколько заплатил (buyer_id на купленных позициях).
 * 2. Справедливая доля = total / members.length (все участники группы).
 * 3. Баланс = заплатил − доля (>0 — ему должны, <0 — он должен).
 * 4. Жадно сопоставляем крупнейшего кредитора с крупнейшим должником.
 */
export function calcSettlement(
  items:    Item[],
  members:  Member[],
  eventId:  string | null = null,
): SettlementResult {
  if (!members.length) return { total: 0, perPerson: 0, transfers: [] }

  const scoped = eventId ? items.filter(i => i.event_id === eventId) : items
  const bought  = scoped.filter(i => i.enabled && i.bought && i.price > 0)

  const total     = bought.reduce((s, i) => s + i.price * i.qty, 0)
  const perPerson = total / members.length

  // Сколько каждый участник заплатил
  const paid = new Map<string, number>(members.map(m => [m.user_id, 0]))
  for (const it of bought) {
    if (it.buyer_id) paid.set(it.buyer_id, (paid.get(it.buyer_id) ?? 0) + it.price * it.qty)
  }

  // Баланс каждого
  const balances = members.map(m => ({
    id:      m.user_id,
    name:    m.name,
    balance: (paid.get(m.user_id) ?? 0) - perPerson,
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
