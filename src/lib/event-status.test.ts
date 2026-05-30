import { describe, it, expect } from 'vitest'

import { canAdminCompleteEvent, isEventActive } from './event-status'
import type { PicnicEvent } from '../types'

const baseEvent: PicnicEvent = {
  id: 'e1',
  group_id: 'g1',
  name: 'Пикник',
  event_date: null,
  event_time: null,
  location: null,
  description: null,
  status: 'active',
  created_at: '2024-01-01T00:00:00.000Z',
}

describe('isEventActive', () => {
  it('active — активно', () => {
    expect(isEventActive('active')).toBe(true)
  })

  it('completed — не активно', () => {
    expect(isEventActive('completed')).toBe(false)
  })

  it('пустой status — активно', () => {
    expect(isEventActive(undefined)).toBe(true)
    expect(isEventActive(null)).toBe(true)
  })
})

describe('canAdminCompleteEvent', () => {
  it('админ + активное событие', () => {
    expect(canAdminCompleteEvent(true, baseEvent)).toBe(true)
  })

  it('не админ', () => {
    expect(canAdminCompleteEvent(false, baseEvent)).toBe(false)
  })

  it('завершённое событие', () => {
    expect(canAdminCompleteEvent(true, { ...baseEvent, status: 'completed' })).toBe(false)
  })

  it('без события', () => {
    expect(canAdminCompleteEvent(true, undefined)).toBe(false)
  })
})
