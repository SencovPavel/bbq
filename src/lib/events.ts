import { isEventActive } from './event-status'

import type { PicnicEvent } from '../types'

/** Сравнение для выбора самого нового события (дата → created_at). */
const compareEventsNewestFirst = (a: PicnicEvent, b: PicnicEvent): number => {
  const dateA = a.event_date ?? ''
  const dateB = b.event_date ?? ''
  if (dateA !== dateB) return dateB.localeCompare(dateA)
  return b.created_at.localeCompare(a.created_at)
}

/**
 * Выбирает событие для автоматического открытия при входе в группу.
 * Приоритет: активное (status='active') → последнее по дате/созданию → undefined.
 */
export const pickEventOnEntry = (events: PicnicEvent[]): PicnicEvent | undefined => {
  if (!events.length) return undefined
  const active = events.find(e => isEventActive(e.status))
  if (active) return active
  return [...events].sort(compareEventsNewestFirst)[0]
}
