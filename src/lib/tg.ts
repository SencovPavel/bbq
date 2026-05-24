/**
 * Platform abstraction: поддерживает Telegram Mini Apps и MAX WebApp.
 * Внешний интерфейс модуля остаётся прежним — остальной код не меняется.
 */
import type { User } from '../types'

// ── Type declarations ─────────────────────────────────────────────────────────

interface WebAppUser {
  id: number
  first_name: string
  last_name?: string
  username?: string
}

interface WebAppInitData {
  user?: WebAppUser
  start_param?: string
  query_id?: string
  auth_date?: number
  hash?: string
}

interface WebAppBridge {
  ready?(): void
  expand?(): void
  initDataUnsafe: WebAppInitData
  platform?: string
  version?: string
  HapticFeedback?: {
    impactOccurred(style: string): void
    notificationOccurred(type: string): void
  }
}

declare global {
  interface Window {
    // Telegram Mini Apps
    Telegram?: { WebApp: WebAppBridge }
    // MAX Bridge (window.WebApp напрямую)
    WebApp?: WebAppBridge
  }
}

// ── Platform detection ────────────────────────────────────────────────────────

export type Platform = 'telegram' | 'max' | 'web'

/** Возвращает активный WebApp объект (MAX или Telegram) либо null */
function getWebApp(): WebAppBridge | null {
  const maxApp = window.WebApp
  const tgApp  = window.Telegram?.WebApp

  // Сначала ищем тот, у кого есть реальный пользователь
  if (maxApp?.initDataUnsafe?.user) return maxApp
  if (tgApp?.initDataUnsafe?.user)  return tgApp

  // Фолбэк: бридж есть, но user ещё не пришёл (редкий случай на старте)
  if (maxApp?.initDataUnsafe) return maxApp
  if (tgApp?.initDataUnsafe)  return tgApp

  return null
}

export function getPlatform(): Platform {
  if (window.WebApp?.initDataUnsafe?.user) return 'max'
  if (window.Telegram?.WebApp?.initDataUnsafe?.user) return 'telegram'
  return 'web'
}

// Для обратной совместимости с кодом, который делал import { tg }
export const tg = window.Telegram?.WebApp ?? null

// ── Public API ────────────────────────────────────────────────────────────────

export function initTg(): void {
  const wa = getWebApp()
  if (!wa) return
  try { wa.ready?.() } catch {}
  try { wa.expand?.() } catch {}
}

export function getTgUser(): User | null {
  const u = getWebApp()?.initDataUnsafe?.user
  if (!u?.id) return null
  return {
    id:   String(u.id),
    name: [u.first_name, u.last_name].filter(Boolean).join(' ') || u.username || 'Участник',
  }
}

export function getStartParam(): string | null {
  return getWebApp()?.initDataUnsafe?.start_param ?? null
}

/** Тактильная обратная связь — поддерживается только Telegram */
export function haptic(type = 'light'): void {
  window.Telegram?.WebApp?.HapticFeedback?.impactOccurred(type)
}

export function hapticNotify(type = 'success'): void {
  window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred(type)
}
