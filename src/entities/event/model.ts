/**
 * Event domain — pure functions.
 *
 * Status helpers live here conceptually; the implementation is in
 * @shared/lib/event-status so that shared/lib/events.ts can import
 * isEventActive without violating FSD (shared must not import entities).
 * Import from this file in screens/widgets.
 */
import type { PicnicEvent } from '@shared/types'

export { isEventActive, isEventItemsLocked, canAdminCompleteEvent } from '@shared/lib/event-status'
export { sendEventUpdates } from '@shared/lib/event-update'

/** Сообщение при попытке правки списка завершённого события (см. isEventItemsLocked). */
export const LIST_LOCKED_MESSAGE = 'Событие завершено — список только для просмотра'

/** Текущее событие по id; undefined — если событие не выбрано или не найдено. */
export const selectCurrentEvent = (
  events: PicnicEvent[],
  currentEventId: string | null | undefined,
): PicnicEvent | undefined =>
  currentEventId ? events.find(e => e.id === currentEventId) : undefined

/**
 * Учитывается ли бюджет в событии.
 * Отсутствие события и старые записи без флага трактуем как «с бюджетом».
 */
export const selectHasBudget = (event: PicnicEvent | undefined): boolean =>
  event?.has_budget !== false
