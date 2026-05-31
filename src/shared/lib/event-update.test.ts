import { describe, it, expect, vi } from 'vitest'

import { sendEventUpdates } from './event-update'

describe('sendEventUpdates', () => {
  it('отправляет event:update только для переданных полей', () => {
    const send = vi.fn()
    sendEventUpdates(send, 'e1', { description: 'Новый текст' })
    expect(send).toHaveBeenCalledTimes(1)
    expect(send).toHaveBeenCalledWith({
      type: 'event:update',
      id: 'e1',
      field: 'description',
      value: 'Новый текст',
    })
  })

  it('передаёт null для пустого описания', () => {
    const send = vi.fn()
    sendEventUpdates(send, 'e1', { description: null })
    expect(send).toHaveBeenCalledWith({
      type: 'event:update',
      id: 'e1',
      field: 'description',
      value: null,
    })
  })
})
