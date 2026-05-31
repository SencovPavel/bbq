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
  initData?: string
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
    Telegram?: { WebApp: WebAppBridge }
    WebApp?: WebAppBridge
  }
}

// ── Platform detection ────────────────────────────────────────────────────────

export type Platform = 'telegram' | 'max' | 'web'

function getWebApp(): WebAppBridge | null {
  const maxApp = window.WebApp
  const tgApp = window.Telegram?.WebApp

  if (maxApp?.initDataUnsafe?.user) return maxApp
  if (tgApp?.initDataUnsafe?.user) return tgApp

  if (maxApp?.initDataUnsafe) return maxApp
  if (tgApp?.initDataUnsafe) return tgApp

  return null
}

export function getPlatform(): Platform {
  if (window.WebApp?.initDataUnsafe?.user) return 'max'
  if (window.Telegram?.WebApp?.initDataUnsafe?.user) return 'telegram'
  return 'web'
}

export const tg = window.Telegram?.WebApp ?? null

/** Полная строка initData для серверной валидации (не initDataUnsafe). */
export const getTelegramInitData = (): string | null => {
  const wa = getWebApp()
  if (wa?.initData && wa.initData.length > 0) return wa.initData
  const tgRaw = window.Telegram?.WebApp?.initData
  if (typeof tgRaw === 'string' && tgRaw.length > 0) return tgRaw
  return null
}

export function initTg(): void {
  const wa = getWebApp()
  if (!wa) return
  try { wa.ready?.() } catch { /* bridge */ }
  try { wa.expand?.() } catch { /* bridge */ }
}

export function getTgUser(): User | null {
  const u = getWebApp()?.initDataUnsafe?.user
  if (!u?.id) return null
  return {
    id: String(u.id),
    name: [u.first_name, u.last_name].filter(Boolean).join(' ') || u.username || 'Участник',
  }
}

export function getStartParam(): string | null {
  return getWebApp()?.initDataUnsafe?.start_param ?? null
}

export function haptic(type = 'light'): void {
  window.Telegram?.WebApp?.HapticFeedback?.impactOccurred(type)
}

export function hapticNotify(type = 'success'): void {
  window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred(type)
}
