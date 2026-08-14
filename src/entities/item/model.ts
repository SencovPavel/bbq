/**
 * Item domain — pure functions.
 *
 * Unit helpers live here conceptually; the implementation is in
 * @shared/lib/item-unit so that lower layers (shared) can stay free
 * of entities imports. Import from this file in screens/widgets.
 */
import type { Item } from '@shared/types'

export { stepForUnit, fmtQty } from '@shared/lib/item-unit'

/** Единицы измерения, доступные в формах добавления позиции. */
export const ITEM_UNITS = ['шт','кг','л','г','мл','упак','наб','пуч','банк','меш','рул']

/**
 * Позиции текущего события.
 * Без выбранного события возвращаем весь список (режим «все позиции группы»).
 */
export const selectEventItems = (
  items: Item[],
  currentEventId: string | null | undefined,
): Item[] =>
  currentEventId ? items.filter(i => i.event_id === currentEventId) : items

/** Total cost of a single bought item line. */
export const lineTotal = (price: number, qty: number): number => price * qty

/** True when an item has been priced. */
export const hasPrize = (price: number): boolean => price > 0
