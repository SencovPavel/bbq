import { describe, it, expect, beforeEach } from 'vitest'
import {
  loadGroupUi,
  saveGroupUiPatch,
  loadOpenCats,
  saveOpenCats,
  eventUiKey,
} from '../ui-persist'

beforeEach(() => localStorage.clear())

// ── loadGroupUi — defaults ────────────────────────────────────────────────────

describe('loadGroupUi', () => {
  it('возвращает дефолты для неизвестной группы', () => {
    const ui = loadGroupUi('g-unknown')
    expect(ui.tab).toBe('list')
    expect(ui.currentEventId).toBeNull()
    expect(ui.summaryPanelOpen).toBe(false)
    expect(ui.openCatsByEvent).toEqual({})
  })

  it('восстанавливает сохранённый tab', () => {
    saveGroupUiPatch('g1', { tab: 'summary' })
    expect(loadGroupUi('g1').tab).toBe('summary')
  })

  it('отклоняет невалидный tab и возвращает "list"', () => {
    localStorage.setItem('picnic_ui_v1', JSON.stringify({ g1: { tab: 'hack' } }))
    expect(loadGroupUi('g1').tab).toBe('list')
  })

  it('восстанавливает currentEventId', () => {
    saveGroupUiPatch('g1', { currentEventId: 'evt-42' })
    expect(loadGroupUi('g1').currentEventId).toBe('evt-42')
  })

  it('summaryPanelOpen по умолчанию false', () => {
    saveGroupUiPatch('g1', { tab: 'summary' })
    expect(loadGroupUi('g1').summaryPanelOpen).toBe(false)
  })

  it('восстанавливает summaryPanelOpen=true', () => {
    saveGroupUiPatch('g1', { summaryPanelOpen: true })
    expect(loadGroupUi('g1').summaryPanelOpen).toBe(true)
  })
})

// ── saveGroupUiPatch ──────────────────────────────────────────────────────────

describe('saveGroupUiPatch', () => {
  it('не затирает другие группы', () => {
    saveGroupUiPatch('g1', { tab: 'my' })
    saveGroupUiPatch('g2', { tab: 'summary' })
    expect(loadGroupUi('g1').tab).toBe('my')
    expect(loadGroupUi('g2').tab).toBe('summary')
  })

  it('мержит поверх предыдущего состояния', () => {
    saveGroupUiPatch('g1', { tab: 'my', summaryPanelOpen: true })
    saveGroupUiPatch('g1', { tab: 'summary' })
    expect(loadGroupUi('g1').summaryPanelOpen).toBe(true) // не потерялось
    expect(loadGroupUi('g1').tab).toBe('summary')
  })
})

// ── openCatsByEvent ───────────────────────────────────────────────────────────

describe('loadOpenCats / saveOpenCats', () => {
  it('сохраняет состояние раскрытых категорий для события', () => {
    saveOpenCats('g1', 'evt1', { food: true, drinks: false })
    const cats = loadOpenCats('g1', 'evt1')
    expect(cats.food).toBe(true)
    expect(cats.drinks).toBe(false)
  })

  it('возвращает {} для нового события', () => {
    expect(loadOpenCats('g1', 'new-evt')).toEqual({})
  })

  it('события хранятся раздельно', () => {
    saveOpenCats('g1', 'evt1', { food: true })
    saveOpenCats('g1', 'evt2', { meat: true })
    expect(loadOpenCats('g1', 'evt1').food).toBe(true)
    expect(loadOpenCats('g1', 'evt1').meat).toBeUndefined()
    expect(loadOpenCats('g1', 'evt2').meat).toBe(true)
  })
})

// ── eventUiKey ────────────────────────────────────────────────────────────────

describe('eventUiKey', () => {
  it('возвращает "_default" для null', () => {
    expect(eventUiKey(null)).toBe('_default')
  })

  it('возвращает id события', () => {
    expect(eventUiKey('evt-7')).toBe('evt-7')
  })
})
