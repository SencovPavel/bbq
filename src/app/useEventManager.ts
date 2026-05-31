/**
 * useEventManager — handles event lifecycle side-effects:
 * auto-selecting the active event, resetting a deleted event,
 * and prompting admins when there are no events yet.
 *
 * Called once at the App root.
 */
import { useEffect, useRef } from 'react'

import { pickEventOnEntry } from '@shared/lib/events'

import { useAppStore } from '../stores/appStore'
import { useSessionStore } from '../stores/sessionStore'
import { useWsStore } from '../stores/wsStore'

export function useEventManager() {
  const screen          = useAppStore(s => s.screen)
  const currentEventId  = useAppStore(s => s.currentEventId)
  const enterEvent      = useAppStore(s => s.enterEvent)
  const exitEvent       = useAppStore(s => s.exitEvent)
  const setShowEventSheet = useAppStore(s => s.setShowEventSheet)

  const me      = useSessionStore(s => s.me)
  const groupId = useSessionStore(s => s.groupId)

  const serverState = useWsStore(s => s.serverState)

  const noEventsSheetOpenedRef = useRef<string | null>(null)

  // Reset if currently-selected event was deleted on the server
  useEffect(() => {
    if (screen !== 'app' || !currentEventId || !serverState?.events) return
    const exists = serverState.events.some(e => e.id === currentEventId)
    if (!exists) exitEvent()
  }, [serverState?.events, currentEventId, screen, exitEvent])

  // Auto-pick the active event when group state first loads
  useEffect(() => {
    if (screen !== 'app' || currentEventId) return
    const pick = pickEventOnEntry(serverState?.events ?? [])
    if (pick) enterEvent(pick.id)
  }, [serverState?.events, screen, currentEventId, enterEvent])

  // Prompt admin to create first event (once per group per session)
  useEffect(() => {
    if (screen !== 'app' || !groupId || !serverState) return
    if (serverState.events.length > 0) return
    if (noEventsSheetOpenedRef.current === groupId) return
    const isAdmin = serverState.members.some(m => m.user_id === me?.id && m.is_admin)
    if (!isAdmin) return
    noEventsSheetOpenedRef.current = groupId
    setShowEventSheet(true)
  }, [screen, groupId, serverState, me?.id, setShowEventSheet])

  // Reset the "already shown" ref when leaving a group
  useEffect(() => {
    if (!groupId) noEventsSheetOpenedRef.current = null
  }, [groupId])
}
