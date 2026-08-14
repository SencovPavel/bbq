import { describe, it, expect } from 'vitest'

import { selectCurrentEvent, selectHasBudget, LIST_LOCKED_MESSAGE } from './model'
import type { PicnicEvent } from '@shared/types'

const makeEvent = (over: Partial<PicnicEvent> = {}): PicnicEvent => ({
  id: 'e1',
  group_id: 'g1',
  name: 'Пикник',
  event_date: null,
  event_time: null,
  location: null,
  description: null,
  status: 'active',
  created_at: '2024-01-01T00:00:00.000Z',
  type: null,
  has_budget: true,
  ...over,
})

const events = [makeEvent({ id: 'e1' }), makeEvent({ id: 'e2', name: 'Баня' })]

describe('selectCurrentEvent', () => {
  it('находит событие по id', () => {
    expect(selectCurrentEvent(events, 'e2')?.name).toBe('Баня')
  })

  it('без выбранного события — undefined', () => {
    expect(selectCurrentEvent(events, null)).toBeUndefined()
    expect(selectCurrentEvent(events, undefined)).toBeUndefined()
  })

  it('неизвестный id — undefined', () => {
    expect(selectCurrentEvent(events, 'nope')).toBeUndefined()
  })

  it('пустой список — undefined', () => {
    expect(selectCurrentEvent([], 'e1')).toBeUndefined()
  })
})

describe('selectHasBudget', () => {
  it('has_budget true — с бюджетом', () => {
    expect(selectHasBudget(makeEvent({ has_budget: true }))).toBe(true)
  })

  it('has_budget false — без бюджета', () => {
    expect(selectHasBudget(makeEvent({ has_budget: false }))).toBe(false)
  })

  it('без события — считаем, что бюджет есть', () => {
    expect(selectHasBudget(undefined)).toBe(true)
  })
})

describe('LIST_LOCKED_MESSAGE', () => {
  it('непустая строка-константа', () => {
    expect(LIST_LOCKED_MESSAGE).toBe('Событие завершено — список только для просмотра')
  })
})
