import { useState, useEffect, useCallback } from 'react'

import { updateProfile } from '@shared/api/api'
import { useSessionStore } from '@stores/sessionStore'
import { useAppStore }     from '@stores/appStore'
import { useToastStore }   from '@stores/toastStore'

export function useProfileScreenVM() {
  const me             = useSessionStore(s => s.me)
  const setMe          = useSessionStore(s => s.setMe)
  const previousScreen = useAppStore(s => s.previousScreen)
  const setScreen      = useAppStore(s => s.setScreen)
  const showToast      = useToastStore(s => s.show)

  const [bio,    setBio]    = useState(me?.bio ?? '')
  const [saving, setSaving] = useState(false)

  // sync если me обновился снаружи
  useEffect(() => {
    setBio(me?.bio ?? '')
  }, [me?.bio])

  const handleSave = useCallback(async () => {
    setSaving(true)
    try {
      const updated = await updateProfile({ bio: bio.trim() })
      setMe({ ...me!, bio: updated.bio ?? undefined })
      showToast('Профиль сохранён')
    } catch {
      showToast('Ошибка сохранения', 'error')
    } finally {
      setSaving(false)
    }
  }, [bio, me, setMe, showToast])

  const goBack     = useCallback(() => setScreen(previousScreen ?? 'groups'), [setScreen, previousScreen])
  const goToFamily = useCallback(() => setScreen('family'),  [setScreen])

  return { me, bio, setBio, saving, handleSave, goBack, goToFamily }
}
