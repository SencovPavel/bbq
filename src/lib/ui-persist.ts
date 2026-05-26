import type { Tab } from '../types'

const STORAGE_KEY = 'picnic_ui_v1'

const APP_TABS: Tab[] = ['list', 'summary', 'my', 'members']

export interface GroupUiState {
  tab: Tab
  currentEventId: string | null
  openCatsByEvent: Record<string, Record<string, boolean>>
  summaryPanelOpen: boolean
}

type UiStore = Record<string, Partial<GroupUiState>>

const DEFAULT_GROUP_UI: GroupUiState = {
  tab: 'list',
  currentEventId: null,
  openCatsByEvent: {},
  summaryPanelOpen: false,
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const isTab = (value: unknown): value is Tab =>
  typeof value === 'string' && APP_TABS.includes(value as Tab)

const readStore = (): UiStore => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed: unknown = JSON.parse(raw)
    return isRecord(parsed) ? (parsed as UiStore) : {}
  } catch {
    return {}
  }
}

const writeStore = (store: UiStore): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
  } catch {
    /* quota / private mode */
  }
}

const normalizeOpenCatsByEvent = (value: unknown): Record<string, Record<string, boolean>> => {
  if (!isRecord(value)) return {}

  const result: Record<string, Record<string, boolean>> = {}
  for (const [eventId, cats] of Object.entries(value)) {
    if (!isRecord(cats)) continue
    const normalized: Record<string, boolean> = {}
    for (const [catId, isOpen] of Object.entries(cats)) {
      if (typeof isOpen === 'boolean') normalized[catId] = isOpen
    }
    if (Object.keys(normalized).length > 0) result[eventId] = normalized
  }
  return result
}

export const loadGroupUi = (groupId: string): GroupUiState => {
  const saved = readStore()[groupId]
  if (!saved) return { ...DEFAULT_GROUP_UI }

  return {
    tab: isTab(saved.tab) ? saved.tab : DEFAULT_GROUP_UI.tab,
    currentEventId:
      typeof saved.currentEventId === 'string' ? saved.currentEventId : null,
    openCatsByEvent: normalizeOpenCatsByEvent(saved.openCatsByEvent),
    summaryPanelOpen: saved.summaryPanelOpen === true,
  }
}

export const saveGroupUiPatch = (
  groupId: string,
  patch: Partial<GroupUiState>,
): void => {
  const store = readStore()
  const prev = loadGroupUi(groupId)
  store[groupId] = {
    ...prev,
    ...patch,
    openCatsByEvent: patch.openCatsByEvent ?? prev.openCatsByEvent,
  }
  writeStore(store)
}

/** Ключ события для коллапсов категорий */
export const eventUiKey = (eventId: string | null): string => eventId ?? '_default'

export const loadOpenCats = (
  groupId: string,
  eventId: string | null,
): Record<string, boolean> => {
  const ui = loadGroupUi(groupId)
  return ui.openCatsByEvent[eventUiKey(eventId)] ?? {}
}

export const saveOpenCats = (
  groupId: string,
  eventId: string | null,
  openCats: Record<string, boolean>,
): void => {
  const ui = loadGroupUi(groupId)
  saveGroupUiPatch(groupId, {
    openCatsByEvent: {
      ...ui.openCatsByEvent,
      [eventUiKey(eventId)]: openCats,
    },
  })
}
