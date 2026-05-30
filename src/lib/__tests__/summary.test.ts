import { describe, it, expect } from 'vitest'
import { calcSummary } from '../summary'
import type { Item, Member } from '../../types'

function item(overrides: Partial<Item> = {}): Item {
  return {
    id: 'i1', cat_id: 'food', event_id: null,
    name: 'Товар', qty: 1, unit: 'шт',
    price: 0, enabled: true, bought: false,
    buyer_id: null, buyer_name: null,
    source: 'manual',
    ...overrides,
  }
}

function member(id: string): Member {
  return { user_id: id, name: id, is_admin: false }
}

// ── actualTotal ───────────────────────────────────────────────────────────────

describe('actualTotal', () => {
  it('суммирует price × qty только для купленных с price > 0', () => {
    const items = [
      item({ id: 'i1', bought: true,  price: 100, qty: 2 }), // +200
      item({ id: 'i2', bought: true,  price: 0,   qty: 5 }), // не считается (price=0)
      item({ id: 'i3', bought: false, price: 300, qty: 1 }), // не купили
      item({ id: 'i4', bought: true,  price: 50,  qty: 3 }), // +150
    ]
    const { actualTotal } = calcSummary(items, [])
    expect(actualTotal).toBe(350)
  })

  it('не учитывает отключённые позиции', () => {
    const items = [
      item({ bought: true, price: 500, qty: 1, enabled: false }),
    ]
    const { actualTotal } = calcSummary(items, [])
    expect(actualTotal).toBe(0)
  })

  it('возвращает 0 для пустого списка', () => {
    expect(calcSummary([], []).actualTotal).toBe(0)
  })
})

// ── pct ───────────────────────────────────────────────────────────────────────

describe('pct', () => {
  it('считает процент купленных от всех включённых', () => {
    const items = [
      item({ id: 'i1', bought: true }),
      item({ id: 'i2', bought: true }),
      item({ id: 'i3', bought: false }),
      item({ id: 'i4', bought: false }),
    ]
    expect(calcSummary(items, []).pct).toBe(50)
  })

  it('округляет до целого (Math.round)', () => {
    // 1 из 3 = 33.33...%
    const items = [
      item({ id: 'i1', bought: true }),
      item({ id: 'i2', bought: false }),
      item({ id: 'i3', bought: false }),
    ]
    expect(calcSummary(items, []).pct).toBe(33)
  })

  it('100% когда все куплены', () => {
    const items = [
      item({ id: 'i1', bought: true }),
      item({ id: 'i2', bought: true }),
    ]
    expect(calcSummary(items, []).pct).toBe(100)
  })

  it('0 для пустого списка (нет деления на 0)', () => {
    expect(calcSummary([], []).pct).toBe(0)
  })
})

// ── perPerson ─────────────────────────────────────────────────────────────────

describe('perPerson', () => {
  it('делит сумму на количество участников', () => {
    const items = [item({ bought: true, price: 900, qty: 1 })]
    const members = [member('u1'), member('u2'), member('u3')]
    expect(calcSummary(items, members).perPerson).toBe(300)
  })

  it('null если нет участников', () => {
    const items = [item({ bought: true, price: 500, qty: 1 })]
    expect(calcSummary(items, []).perPerson).toBeNull()
  })

  it('null если сумма равна 0', () => {
    const items = [item({ bought: true, price: 0, qty: 1 })]
    const members = [member('u1')]
    expect(calcSummary(items, members).perPerson).toBeNull()
  })
})

// ── фильтрация по событию ─────────────────────────────────────────────────────

describe('фильтрация по currentEventId', () => {
  it('без eventId считает все позиции', () => {
    const items = [
      item({ id: 'i1', event_id: 'evt1', bought: true, price: 100, qty: 1 }),
      item({ id: 'i2', event_id: 'evt2', bought: true, price: 200, qty: 1 }),
    ]
    expect(calcSummary(items, [], null).actualTotal).toBe(300)
  })

  it('с eventId считает только позиции события', () => {
    const items = [
      item({ id: 'i1', event_id: 'evt1', bought: true, price: 100, qty: 1 }),
      item({ id: 'i2', event_id: 'evt2', bought: true, price: 200, qty: 1 }),
    ]
    expect(calcSummary(items, [], 'evt1').actualTotal).toBe(100)
  })
})
