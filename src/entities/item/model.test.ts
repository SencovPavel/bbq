import { describe, it, expect } from 'vitest'

import { selectEventItems, lineTotal, hasPrize, ITEM_UNITS } from './model'
import type { Item } from '@shared/types'

const makeItem = (over: Partial<Item> = {}): Item => ({
  id: 'i1',
  cat_id: 'c1',
  event_id: null,
  kind: 'bring',
  name: 'Шашлык',
  qty: 1,
  unit: 'кг',
  price: 0,
  enabled: true,
  bought: false,
  buyer_id: null,
  buyer_name: null,
  source: 'manual',
  ...over,
})

const items = [
  makeItem({ id: 'i1', event_id: 'e1' }),
  makeItem({ id: 'i2', event_id: 'e2' }),
  makeItem({ id: 'i3', event_id: null }),
]

describe('selectEventItems', () => {
  it('фильтрует позиции по событию', () => {
    expect(selectEventItems(items, 'e1').map(i => i.id)).toEqual(['i1'])
  })

  it('без выбранного события — весь список', () => {
    expect(selectEventItems(items, null)).toBe(items)
    expect(selectEventItems(items, undefined)).toBe(items)
  })

  it('событие без позиций — пусто', () => {
    expect(selectEventItems(items, 'e9')).toEqual([])
  })

  it('не мутирует исходный массив', () => {
    const src = [...items]
    selectEventItems(src, 'e1')
    expect(src).toEqual(items)
  })
})

describe('lineTotal / hasPrize', () => {
  it('стоимость строки', () => {
    expect(lineTotal(150, 2)).toBe(300)
  })

  it('цена не указана', () => {
    expect(hasPrize(0)).toBe(false)
    expect(hasPrize(10)).toBe(true)
  })
})

describe('ITEM_UNITS', () => {
  it('содержит базовые единицы и не имеет дублей', () => {
    expect(ITEM_UNITS).toContain('шт')
    expect(ITEM_UNITS).toContain('кг')
    expect(new Set(ITEM_UNITS).size).toBe(ITEM_UNITS.length)
  })
})
