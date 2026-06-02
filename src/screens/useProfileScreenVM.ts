import { useState, useEffect, useCallback } from 'react'

import { updateProfile, getUserGroups, getFamilyMembers } from '@shared/api/api'
import { useSessionStore } from '@stores/sessionStore'
import { useAppStore }     from '@stores/appStore'
import { useToastStore }   from '@stores/toastStore'

export function useProfileScreenVM() {
  const me             = useSessionStore(s => s.me)
  const setMe          = useSessionStore(s => s.setMe)
  const previousScreen = useAppStore(s => s.previousScreen)
  const setScreen      = useAppStore(s => s.setScreen)
  const showToast      = useToastStore(s => s.show)

  // ── Статистика ─────────────────────────────────────────────────────────────
  const [groupCount,  setGroupCount]  = useState(0)
  const [familyCount, setFamilyCount] = useState(0)

  useEffect(() => {
    if (!me?.id) return
    Promise.all([getUserGroups(me.id), getFamilyMembers()])
      .then(([grps, fam]) => { setGroupCount(grps.length); setFamilyCount(fam.length) })
      .catch(() => {})
  }, [me?.id])

  // ── Edit sheet ─────────────────────────────────────────────────────────────
  const [saving,   setSaving]   = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [draftBio, setDraftBio] = useState(me?.bio ?? '')

  // sync если me обновился снаружи
  useEffect(() => {
    setDraftBio(me?.bio ?? '')
  }, [me?.bio])

  const openEdit = useCallback(() => {
    setDraftBio(me?.bio ?? '')
    setEditOpen(true)
  }, [me?.bio])

  const handleSave = useCallback(async () => {
    setSaving(true)
    try {
      const updated = await updateProfile({ bio: draftBio.trim() })
      setMe({ ...me!, bio: updated.bio ?? undefined })
      setEditOpen(false)
      showToast('Профиль сохранён')
    } catch {
      showToast('Ошибка сохранения', 'error')
    } finally {
      setSaving(false)
    }
  }, [draftBio, me, setMe, showToast])

  const goBack     = useCallback(() => setScreen(previousScreen ?? 'groups'), [setScreen, previousScreen])
  const goToFamily = useCallback(() => setScreen('family'), [setScreen])

  return {
    me,
    groupCount, familyCount,
    editOpen, setEditOpen, draftBio, setDraftBio, openEdit,
    saving, handleSave,
    goBack, goToFamily,
  }
}
