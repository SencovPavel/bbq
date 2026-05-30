import type { PicnicEvent } from '../types'

/**
 * Выбирает событие для автоматического открытия при входе в группу.
 * Приоритет: активное (status='active') → первое в списке → undefined.
 */
export function pickEventOnEntry(events: PicnicEvent[]): PicnicEvent | undefined {
  if (!events.length) return undefined
  return events.find(e => e.status === 'active') ?? events[0]
}
