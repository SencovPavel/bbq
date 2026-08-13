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

export interface EventAddInput {
  name:         string
  date?:        string | null
  time?:        string | null
  location?:    string | null
  description?: string | null
  type?:        string | null
  hasBudget?:   boolean
}

/**
 * Единый билдер сообщения `event:add`, чтобы событие из любого места
 * (экран «События» и шторка EventSheet) получало одинаковый набор полей —
 * тип события, бюджет и описание — и корректный сидинг категорий на бэкенде.
 */
export function buildEventAddMessage(input: EventAddInput): Record<string, unknown> {
  return {
    type:        'event:add',
    name:        input.name,
    date:        input.date ?? null,
    time:        input.time ?? null,
    location:    input.location ?? null,
    description: input.description ?? null,
    eventType:   input.type ?? null,
    hasBudget:   input.hasBudget ?? true,
  }
}
