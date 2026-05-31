/**
 * Event domain — pure functions.
 *
 * Status helpers live here conceptually; the implementation is in
 * @shared/lib/event-status so that shared/lib/events.ts can import
 * isEventActive without violating FSD (shared must not import entities).
 * Import from this file in screens/widgets.
 */
export { isEventActive, isEventItemsLocked, canAdminCompleteEvent } from '@shared/lib/event-status'
export { sendEventUpdates } from '@shared/lib/event-update'
