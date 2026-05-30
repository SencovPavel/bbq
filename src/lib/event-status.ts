import type { PicnicEvent } from '../types'

/**
 * Событие считается активным, если явно не помечено завершённым.
 * Пустой или неизвестный status трактуем как активный (совместимость со старыми данными).
 */
export const isEventActive = (status: PicnicEvent['status'] | null | undefined): boolean =>
  status !== 'completed'

/** Список покупок закрыт для правок после завершения события. */
export const isEventItemsLocked = (status: PicnicEvent['status'] | null | undefined): boolean =>
  !isEventActive(status)

/** Админ может завершить текущее активное событие. */
export const canAdminCompleteEvent = (
  isAdmin: boolean,
  event: PicnicEvent | undefined,
): boolean => isAdmin && !!event && isEventActive(event.status)
