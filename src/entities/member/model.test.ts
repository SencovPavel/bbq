import { describe, it, expect } from 'vitest'

import { selectAmIAdmin, memberInitials } from './model'
import type { Member } from '@shared/types'

const members: Member[] = [
  { user_id: 'u1', name: 'Аня',  is_admin: true  },
  { user_id: 'u2', name: 'Боря', is_admin: false },
]

describe('selectAmIAdmin', () => {
  it('админ группы', () => {
    expect(selectAmIAdmin(members, 'u1')).toBe(true)
  })

  it('обычный участник', () => {
    expect(selectAmIAdmin(members, 'u2')).toBe(false)
  })

  it('не участник группы', () => {
    expect(selectAmIAdmin(members, 'u3')).toBe(false)
  })

  it('без meId', () => {
    expect(selectAmIAdmin(members, null)).toBe(false)
    expect(selectAmIAdmin(members, undefined)).toBe(false)
  })

  it('пустой список участников', () => {
    expect(selectAmIAdmin([], 'u1')).toBe(false)
  })
})

describe('memberInitials', () => {
  it('имя и фамилия — две буквы', () => {
    expect(memberInitials('Анна Ключ')).toBe('АК')
  })

  it('одно слово — первые две буквы', () => {
    expect(memberInitials('Анна')).toBe('АН')
  })
})
