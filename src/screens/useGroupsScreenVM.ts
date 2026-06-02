import { useState, useEffect } from 'react'
import { getUserGroups } from '@shared/api/api'
import { useSessionStore } from '@stores/sessionStore'
import { useAppStore }     from '@stores/appStore'
import type { GroupSummary } from '@shared/types'

export function useGroupsScreenVM() {
  const me        = useSessionStore(s => s.me)
  const setScreen = useAppStore(s => s.setScreen)

  const [groups,  setGroups]  = useState<GroupSummary[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!me?.id) { setLoading(false); return }
    getUserGroups(me.id)
      .then(setGroups)
      .catch(() => setGroups([]))
      .finally(() => setLoading(false))
  }, [me?.id])

  return {
    me,
    groups,
    loading,
    goToProfile: () => setScreen('profile'),
  }
}
