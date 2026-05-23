import type { User } from '../types'

declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        ready(): void
        expand(): void
        initDataUnsafe: {
          user?: {
            id: number
            first_name: string
            last_name?: string
            username?: string
          }
          start_param?: string
        }
        HapticFeedback: {
          impactOccurred(style: string): void
          notificationOccurred(type: string): void
        }
      }
    }
  }
}

export const tg = window.Telegram?.WebApp

export function initTg(): void {
  if (tg) { tg.ready(); tg.expand() }
}

export function getTgUser(): User | null {
  const u = tg?.initDataUnsafe?.user
  if (!u) return null
  return {
    id:   String(u.id),
    name: [u.first_name, u.last_name].filter(Boolean).join(' ') || u.username || 'Участник',
  }
}

export function getStartParam(): string | null {
  return tg?.initDataUnsafe?.start_param ?? null
}

export function haptic(type = 'light'): void {
  tg?.HapticFeedback?.impactOccurred(type)
}

export function hapticNotify(type = 'success'): void {
  tg?.HapticFeedback?.notificationOccurred(type)
}
