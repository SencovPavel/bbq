import { describe, it, expect } from 'vitest'
import { pickEventOnEntry } from '../events'
import type { PicnicEvent } from '@shared/types'

// ── helpers ───────────────────────────────────────────────────────────────────

function event(
  id: string,
  status: 'active' | 'completed',
  overrides: Partial<Pick<PicnicEvent, 'event_date' | 'created_at'>> = {},
): PicnicEvent {
  return {
    id,
    status,
    group_id: 'g1',
    name: `Событие ${id}`,
    event_date: null,
    event_time: null,
    location: null,
    description: null,
    created_at: '2024-01-01T00:00:00.000Z',
    type: null,
    has_budget: true,
    ...overrides,
  }
}

// ── pickEventOnEntry ──────────────────────────────────────────────────────────

describe('pickEventOnEntry', () => {
  it('выбирает активное событие при наличии', () => {
    const events = [event('e1', 'completed'), event('e2', 'active'), event('e3', 'completed')]
    expect(pickEventOnEntry(events)?.id).toBe('e2')
  })

  it('выбирает последнее по дате если нет активных', () => {
    const events = [
      event('e1', 'completed', { event_date: '2024-01-15', created_at: '2024-01-15T00:00:00.000Z' }),
      event('e2', 'completed', { event_date: '2024-06-20', created_at: '2024-06-20T00:00:00.000Z' }),
    ]
    expect(pickEventOnEntry(events)?.id).toBe('e2')
  })

  it('без дат выбирает последнее по created_at', () => {
    const events = [
      event('older', 'completed', { created_at: '2024-01-01T00:00:00.000Z' }),
      event('newer', 'completed', { created_at: '2024-12-01T00:00:00.000Z' }),
    ]
    expect(pickEventOnEntry(events)?.id).toBe('newer')
  })

  it('возвращает undefined для пустого списка', () => {
    expect(pickEventOnEntry([])).toBeUndefined()
  })

  it('игнорирует завершённые при наличии активного', () => {
    const events = [event('completed-first', 'completed'), event('active-second', 'active')]
    expect(pickEventOnEntry(events)?.id).toBe('active-second')
  })

  it('одно активное событие — выбирает его', () => {
    expect(pickEventOnEntry([event('only', 'active')])?.id).toBe('only')
  })
})

