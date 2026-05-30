import type { User } from '../types'

export function saveSession(me: User, groupId: string): void {
  try {
    sessionStorage.setItem('picnic_me', JSON.stringify(me))
    sessionStorage.setItem('picnic_group', groupId)
  } catch {}
}

export function loadSession(): { me: User; groupId: string } | null {
  try {
    const me      = sessionStorage.getItem('picnic_me')
    const groupId = sessionStorage.getItem('picnic_group')
    if (me && groupId) return { me: JSON.parse(me) as User, groupId }
  } catch {}
  return null
}

export function clearGroupSession(): void {
  try { sessionStorage.removeItem('picnic_group') } catch {}
}

export function fmt(n: number): string {
  return new Intl.NumberFormat('ru-RU').format(Math.round(n)) + '₽'
}
