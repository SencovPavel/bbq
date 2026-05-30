import { describe, it, expect, beforeEach } from 'vitest'
import { fmt, saveSession, loadSession, clearGroupSession } from '../session'
import type { User } from '../../types'

const ME: User = { id: 'u1', name: 'Павел' }

beforeEach(() => sessionStorage.clear())

// ── fmt ───────────────────────────────────────────────────────────────────────

describe('fmt', () => {
  it('форматирует 0', () => {
    expect(fmt(0)).toBe('0₽')
  })

  it('добавляет пробел-разделитель тысяч для 1850', () => {
    // Intl.NumberFormat('ru-RU') использует   (неразрывный пробел)
    const result = fmt(1850)
    expect(result.replace(/\s/g, ' ')).toBe('1 850₽')
  })

  it('округляет до целого', () => {
    expect(fmt(99.7)).toBe('100₽')
    expect(fmt(99.4)).toBe('99₽')
  })

  it('работает с отрицательными числами', () => {
    const result = fmt(-100)
    expect(result).toContain('100')
    expect(result).toContain('₽')
  })
})

// ── saveSession / loadSession ─────────────────────────────────────────────────

describe('saveSession / loadSession', () => {
  it('сохраняет и восстанавливает сессию', () => {
    saveSession(ME, 'group42')
    const session = loadSession()
    expect(session).not.toBeNull()
    expect(session!.me).toEqual(ME)
    expect(session!.groupId).toBe('group42')
  })

  it('возвращает null если sessionStorage пуст', () => {
    expect(loadSession()).toBeNull()
  })

  it('перезаписывает предыдущую сессию', () => {
    saveSession(ME, 'old-group')
    saveSession({ id: 'u2', name: 'Иван' }, 'new-group')
    const session = loadSession()
    expect(session!.groupId).toBe('new-group')
    expect(session!.me.name).toBe('Иван')
  })
})

// ── clearGroupSession ─────────────────────────────────────────────────────────

describe('clearGroupSession', () => {
  it('удаляет groupId но сохраняет me', () => {
    saveSession(ME, 'group1')
    clearGroupSession()
    // me остаётся
    expect(sessionStorage.getItem('picnic_me')).not.toBeNull()
    // group удалён → loadSession вернёт null (нет обоих ключей)
    expect(loadSession()).toBeNull()
  })
})
