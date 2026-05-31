import { describe, it, expect, beforeEach } from 'vitest'
import { useAppStore } from '@stores/appStore'

// ── appStore.hydrateGroupUi ───────────────────────────────────────────────────

describe('appStore.hydrateGroupUi', () => {
  beforeEach(() => {
    localStorage.clear()
    useAppStore.setState({ currentEventId: null })
  })

  it('сбрасывает currentEventId в null даже если в localStorage хранится ID', () => {
    localStorage.setItem('picnic_ui_v1', JSON.stringify({
      g1: { currentEventId: 'old-event-id', tab: 'list' },
    }))

    useAppStore.getState().hydrateGroupUi('g1')

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
    useAppStore.setState({ currentEventId: 'g2-event' })
    useAppStore.getState().hydrateGroupUi('g1')
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
