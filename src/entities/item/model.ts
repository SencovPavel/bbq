/**
 * Item domain — pure functions.
 *
 * Unit helpers live here conceptually; the implementation is in
 * @shared/lib/item-unit so that lower layers (shared) can stay free
 * of entities imports. Import from this file in screens/widgets.
 */
export { stepForUnit, fmtQty } from '@shared/lib/item-unit'

/** Total cost of a single bought item line. */
export const lineTotal = (price: number, qty: number): number => price * qty

/** True when an item has been priced. */
export const hasPrize = (price: number): boolean => price > 0
