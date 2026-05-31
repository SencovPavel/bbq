import { describe, it, expect } from 'vitest'
import { calcSettlement } from '../settlement'
import type { Item, Member } from '../../types'

// ── helpers ───────────────────────────────────────────────────────────────────

function member(id: string, name: string): Member {
  return { user_id: id, name, is_admin: false }
}

function boughtItem(buyerId: string, price: number, qty = 1, eventId = 'e1'): Item {
  return {
    id: `${buyerId}-${price}`, cat_id: 'food', event_id: eventId,
    name: 'Товар', qty, unit: 'шт', price,
    enabled: true, bought: true,
    buyer_id: buyerId, buyer_name: buyerId,
    source: 'manual',
  }
}

const A = member('a', 'Аня')
const B = member('b', 'Боря')
const C = member('c', 'Саша')

// ── transfers count ───────────────────────────────────────────────────────────

describe('количество переводов', () => {
  it('никто ничего не купил → 0 переводов', () => {
    expect(calcSettlement([], [A, B, C], 'e1').transfers).toHaveLength(0)
  })

  it('все заплатили поровну → 0 переводов', () => {
    const items = [boughtItem('a', 300), boughtItem('b', 300), boughtItem('c', 300)]
    expect(calcSettlement(items, [A, B, C], 'e1').transfers).toHaveLength(0)
  })

  it('один плательщик на троих → 2 перевода', () => {
    // Аня заплатила за всех
    const items = [boughtItem('a', 900)]
    const { transfers } = calcSettlement(items, [A, B, C], 'e1')
    expect(transfers).toHaveLength(2)
  })

  it('жадный алгоритм минимизирует переводы', () => {
    // A=600, B=600, C=0, D=0 → total=1200, share=300
    // A+300, B+300, C-300, D-300 → 2 перевода (C→A, D→B), не 4
    const D = member('d', 'Дима')
    const items = [boughtItem('a', 600), boughtItem('b', 600)]
    const { transfers } = calcSettlement(items, [A, B, C, D], 'e1')
    expect(transfers).toHaveLength(2)
  })
})

// ── directions & amounts ──────────────────────────────────────────────────────

describe('направление и суммы переводов', () => {
  it('должник переводит кредитору правильную сумму', () => {
    // A платит 750, B платит 0, share=375 → B переводит A 375₽
    const items = [boughtItem('a', 750)]
    const { transfers } = calcSettlement(items, [A, B], 'e1')
    expect(transfers).toHaveLength(1)
    expect(transfers[0].fromId).toBe('b')
    expect(transfers[0].toId).toBe('a')
    expect(transfers[0].amount).toBe(375)
  })

  it('Аня → Боря → Саша: три человека, один плательщик', () => {
    // Саша платит 900, остальные 0, share=300
    // Аня(-300)→Саша(+600): перевод 300, Аня=0, Саша=+300
    // Боря(-300)→Саша(+300): перевод 300, Боря=0, Саша=0
    const items = [boughtItem('c', 900)]
    const { transfers } = calcSettlement(items, [A, B, C], 'e1')
    expect(transfers).toHaveLength(2)
    transfers.forEach(t => expect(t.toId).toBe('c'))
    const amounts = transfers.map(t => t.amount).sort()
    expect(amounts).toEqual([300, 300])
  })

  it('сумма переводов покрывает долг с точностью до 1₽', () => {
    // 1150 / 3 = 383.33... — дробная доля
    const items = [boughtItem('a', 750), boughtItem('b', 400)]
    const { transfers } = calcSettlement(items, [A, B, C], 'e1')
    const totalTransferred = transfers.reduce((s, t) => s + t.amount, 0)
    // Саша должна ~383₽, разница из-за округления ≤ 1₽
    expect(Math.abs(totalTransferred - 383)).toBeLessThanOrEqual(1)
  })
})

// ── edge cases ────────────────────────────────────────────────────────────────

describe('граничные случаи', () => {
  it('один участник → 0 переводов (должник = кредитор)', () => {
    const items = [boughtItem('a', 500)]
    expect(calcSettlement(items, [A], 'e1').transfers).toHaveLength(0)
  })

  it('нет участников → пустой результат', () => {
    const r = calcSettlement([boughtItem('a', 100)], [], 'e1')
    expect(r.transfers).toHaveLength(0)
    expect(r.total).toBe(0)
  })

  it('позиции без цены (price=0) не учитываются', () => {
    const free: Item = { ...boughtItem('a', 0), price: 0 }
    expect(calcSettlement([free], [A, B], 'e1').transfers).toHaveLength(0)
  })

  it('отключённые позиции не учитываются', () => {
    const disabled: Item = { ...boughtItem('a', 500), enabled: false }
    expect(calcSettlement([disabled], [A, B], 'e1').transfers).toHaveLength(0)
  })

  it('фильтрация по eventId: другое событие не попадает в расчёт', () => {
    const items = [
      boughtItem('a', 600, 1, 'e1'),
      boughtItem('b', 600, 1, 'e2'), // другое событие
    ]
    // Для e1: только Аня заплатила 600, Боря должен 300
    const { transfers } = calcSettlement(items, [A, B], 'e1')
    expect(transfers).toHaveLength(1)
    expect(transfers[0].fromId).toBe('b')
    expect(transfers[0].amount).toBe(300)
  })

  it('qty > 1 учитывается в сумме', () => {
    // Аня покупает 3 кг мяса по 200₽ = 600₽ итого
    const items = [boughtItem('a', 200, 3)]
    const { total } = calcSettlement(items, [A, B], 'e1')
    expect(total).toBe(600)
  })
})

// ── total & perPerson ─────────────────────────────────────────────────────────

describe('итоговые метрики', () => {
  it('total = сумма всех купленных позиций', () => {
    const items = [boughtItem('a', 300), boughtItem('b', 450)]
    expect(calcSettlement(items, [A, B], 'e1').total).toBe(750)
  })

  it('perPerson = total / количество участников', () => {
    const items = [boughtItem('a', 900)]
    expect(calcSettlement(items, [A, B, C], 'e1').perPerson).toBe(300)
  })
})
