import { describe, it, expect, beforeEach } from 'vitest'
import { pickEventOnEntry } from '../events'
import { useAppStore } from '../../stores/appStore'
import type { PicnicEvent } from '../../types'

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

// ── appStore.hydrateGroupUi ───────────────────────────────────────────────────

describe('appStore.hydrateGroupUi', () => {
  beforeEach(() => {
    localStorage.clear()
    useAppStore.setState({ currentEventId: null })
  })

  it('сбрасывает currentEventId в null даже если в localStorage хранится ID', () => {
    // Сохраняем ID события в localStorage
    localStorage.setItem('picnic_ui_v1', JSON.stringify({
      g1: { currentEventId: 'old-event-id', tab: 'list' },
    }))

    // Входим в группу
    useAppStore.getState().hydrateGroupUi('g1')

    // Должен быть null, а не 'old-event-id'
    expect(useAppStore.getState().currentEventId).toBeNull()
  })

  it('восстанавливает tab из localStorage', () => {
    localStorage.setItem('picnic_ui_v1', JSON.stringify({
      g1: { tab: 'summary', currentEventId: 'evt1' },
    }))
    useAppStore.getState().hydrateGroupUi('g1')
    expect(useAppStore.getState().tab).toBe('summary')
  })

  it('не трогает currentEventId другой группы в store', () => {
    // Устанавливаем event для g2
    useAppStore.setState({ currentEventId: 'g2-event' })
    // Hydrate для g1 (другой группы)
    useAppStore.getState().hydrateGroupUi('g1')
    // g1 → null, потому что только что вошли в g1
    expect(useAppStore.getState().currentEventId).toBeNull()
  })
})

// ── appStore.enterEvent / exitEvent ───────────────────────────────────────────

describe('appStore event lifecycle', () => {
  beforeEach(() => {
    localStorage.clear()
    useAppStore.setState({ currentEventId: null })
  })

  it('enterEvent устанавливает currentEventId', () => {
    useAppStore.getState().enterEvent('evt-42')
    expect(useAppStore.getState().currentEventId).toBe('evt-42')
  })

  it('exitEvent сбрасывает currentEventId в null', () => {
    useAppStore.getState().enterEvent('evt-42')
    useAppStore.getState().exitEvent()
    expect(useAppStore.getState().currentEventId).toBeNull()
  })
})
