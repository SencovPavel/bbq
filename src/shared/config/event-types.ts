export interface EventTypeConfig {
  id: string
  label: string
  icon: string
  hasBudgetDefault: boolean
}

// Зеркало picnic-backend/lib/event-types.js (без category-шаблонов — их сидит бэкенд).
export const EVENT_TYPES: EventTypeConfig[] = [
  { id: 'picnic',  label: 'Пикник / выезд',   icon: '🔥', hasBudgetDefault: true },
  { id: 'trip',    label: 'Поездка',          icon: '🧳', hasBudgetDefault: true },
  { id: 'moving',  label: 'Переезд',          icon: '📦', hasBudgetDefault: false },
  { id: 'party',   label: 'Праздник',         icon: '🎉', hasBudgetDefault: true },
  { id: 'cleanup', label: 'Субботник / дело', icon: '🧹', hasBudgetDefault: false },
  { id: 'custom',  label: 'Своё',             icon: '✨', hasBudgetDefault: false },
]

export const EVENT_TYPES_BY_ID: Record<string, EventTypeConfig> =
  Object.fromEntries(EVENT_TYPES.map(t => [t.id, t]))
