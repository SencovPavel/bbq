import type { PicnicEvent } from '../types'

type SendFn = (msg: Record<string, unknown>) => boolean

type EventUpdateField = 'name' | 'event_date' | 'event_time' | 'location' | 'description'

const EVENT_UPDATE_FIELDS: EventUpdateField[] = [
  'name',
  'event_date',
  'event_time',
  'location',
  'description',
]

/** Отправляет event:update по изменённым полям события. */
export const sendEventUpdates = (
  send: SendFn,
  eventId: string,
  data: Partial<Pick<PicnicEvent, EventUpdateField>>,
) => {
  for (const field of EVENT_UPDATE_FIELDS) {
    if (field in data) {
      const value = data[field] ?? null
      send({ type: 'event:update', id: eventId, field, value })
    }
  }
}
