import { useState, useCallback } from 'react'
import { createGroup, joinGroup } from '@shared/api/api'
import { getTelegramInitData } from '@shared/lib/tg'
import { useSessionStore } from '@stores/sessionStore'
import { useAppStore } from '@stores/appStore'
import type { User } from '@shared/types'

export type OnboardingTab = 'create' | 'join'

export function useOnboardingScreenVM(onDone: (user: User, gId: string) => void) {
  const me        = useSessionStore(s => s.me)
  const popScreen = useAppStore(s => s.popScreen)
  const goBack    = useCallback(() => popScreen('groups'), [popScreen])

  const [tab,       setTab]       = useState<OnboardingTab>('create')
  const [err,       setErr]       = useState('')
  const [groupName, setGroupName] = useState('')
  const [code,      setCode]      = useState('')

  const hasTg   = !!me?.id
  const canAuth = hasTg || !!getTelegramInitData()

  function switchTab(t: OnboardingTab) {
    setTab(t)
    setErr('')
  }

  async function doCreate() {
    if (!canAuth) { setErr('Войдите на сайте или откройте приложение в Telegram'); return }
    if (!groupName.trim()) { setErr('Введите название группы'); return }
    if (!hasTg) { setErr('Войдите на сайте или откройте приложение в Telegram'); return }
    setErr('')
    try {
      const d = await createGroup({ name: groupName.trim() })
      if (d.error) { setErr(d.error); return }
      onDone(me!, d.id!)
    } catch { setErr('Нет соединения с сервером') }
  }

  async function doJoin() {
    if (!canAuth) { setErr('Войдите на сайте или откройте приложение в Telegram'); return }
    if (!code.trim()) { setErr('Введите код'); return }
    if (!hasTg) { setErr('Войдите на сайте или откройте приложение в Telegram'); return }
    setErr('')
    try {
      const d = await joinGroup({ inviteCode: code.trim() })
      if (d.error) { setErr(d.error); return }
      onDone(me!, d.id!)
    } catch { setErr('Нет соединения с сервером') }
  }

  return {
    me,
    tab,  switchTab,
    err,
    groupName, setGroupName,
    code,      setCode,
    hasTg,
    canAuth,
    doCreate,
    doJoin,
    goBack,
  }
}
