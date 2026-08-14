import { useEffect, useMemo, useState } from 'react'

import { fmt } from '@shared/lib/session'
import { loadGroupUi, saveGroupUiPatch } from '@shared/lib/ui-persist'
import { analyzeWithAgent } from '@shared/api/api'
import { calcSummary } from '@shared/lib/summary'
import { calcSettlement } from '@shared/lib/settlement'

import { isEventItemsLocked, selectCurrentEvent, selectHasBudget, LIST_LOCKED_MESSAGE } from '@entities/event/model'
import { selectEventItems } from '@entities/item/model'
import { selectAmIAdmin } from '@entities/member/model'

import { useWsStore } from '@stores/wsStore'
import { useSessionStore } from '@stores/sessionStore'
import { useAppStore } from '@stores/appStore'
import { useToastStore } from '@stores/toastStore'

import type { AnalysisResult } from '@shared/types'
import type { AddItemPayload } from '@widgets/AddItemModal'

export function useSummaryScreenVM() {
  const serverState       = useWsStore(s => s.serverState)
  const send              = useWsStore(s => s.send)
  const groupId           = useSessionStore(s => s.groupId)
  const me                = useSessionStore(s => s.me)
  const showToast         = useToastStore(s => s.show)
  const currentEventId    = useAppStore(s => s.currentEventId)
  const setShowEventSheet = useAppStore(s => s.setShowEventSheet)

  const [analysis,  setAnalysis]  = useState<AnalysisResult | null>(null)
  const [loading,   setLoading]   = useState(false)
  const [panelOpen, setPanelOpen] = useState(false)
  const [copied,    setCopied]    = useState(false)
  // Название позиции из панели агента, добавляемой в список (null — модалка закрыта)
  const [addMissingName, setAddMissingName] = useState<string | null>(null)

  // Persist panel open/closed state per group
  useEffect(() => {
    if (!groupId) return
    setPanelOpen(loadGroupUi(groupId).summaryPanelOpen)
  }, [groupId])

  useEffect(() => {
    if (!groupId) return
    saveGroupUiPatch(groupId, { summaryPanelOpen: panelOpen })
  }, [groupId, panelOpen])

  // ── Derived data ─────────────────────────────────────────────────────────────
  const {
    categories = [], items = [], members = [], events = [], activity = [],
    rsvp = [], familyMembers = [], familyRsvp = [],
  } = serverState ?? {}
  const meId = me?.id

  const amIAdmin = useMemo(
    () => selectAmIAdmin(members, meId),
    [members, meId],
  )

  const currentEvent = useMemo(
    () => selectCurrentEvent(events, currentEventId),
    [events, currentEventId],
  )
  const hasBudget  = selectHasBudget(currentEvent)
  const listLocked = isEventItemsLocked(currentEvent?.status)

  const { actualTotal, boughtCount, enabledCount: enabledLen, pct, perPerson, participantWeight } = useMemo(
    () => calcSummary(items, members, currentEventId, rsvp, familyMembers, familyRsvp),
    [items, members, currentEventId, rsvp, familyMembers, familyRsvp],
  )

  const { transfers } = useMemo(
    () => calcSettlement(items, members, currentEventId, rsvp, familyMembers, familyRsvp),
    [items, members, currentEventId, rsvp, familyMembers, familyRsvp],
  )

  const enabled = useMemo(
    () => selectEventItems(items, currentEventId).filter(i => i.enabled),
    [items, currentEventId],
  )

  // Делитель «на человека» с учётом RSVP «не иду» и долей семьи.
  // Целое отображаем как есть, дробное — с одним знаком (напр. 2.5).
  const ppl = Number.isInteger(participantWeight)
    ? participantWeight
    : Number(participantWeight.toFixed(1))

  // ── Personal balance ─────────────────────────────────────────────────────────
  const myTransfers = useMemo(
    () => transfers.filter(t => t.fromId === meId || t.toId === meId),
    [transfers, meId],
  )

  const iSendTotal = useMemo(
    () => myTransfers.filter(t => t.fromId === meId).reduce((s, t) => s + t.amount, 0),
    [myTransfers, meId],
  )

  const iGetTotal = useMemo(
    () => myTransfers.filter(t => t.toId === meId).reduce((s, t) => s + t.amount, 0),
    [myTransfers, meId],
  )

  const net            = iGetTotal - iSendTotal   // >0 — get back, <0 — must send
  const iSend          = net < 0
  const singleTransfer = myTransfers.length === 1 ? myTransfers[0] : null
  const counterparty   = singleTransfer
    ? (singleTransfer.fromId === meId ? singleTransfer.toName : singleTransfer.fromName)
    : null

  // ── Per-category totals ──────────────────────────────────────────────────────
  const catRows = useMemo(
    () => categories
      .map(cat => {
        const catItems  = enabled.filter(x => x.cat_id === cat.id)
        const catBought = catItems.filter(x => x.bought && x.price > 0)
        const catTotal  = catBought.reduce((s, x) => s + x.price * x.qty, 0)
        const catDone   = catItems.filter(x => x.bought).length
        return { cat, catItems, catTotal, catDone }
      })
      .filter(r => r.catItems.length > 0),
    [categories, enabled],
  )

  // ── Actions ──────────────────────────────────────────────────────────────────
  async function runAnalysis() {
    if (!groupId) return
    setLoading(true)
    setPanelOpen(false)
    try {
      const r = await analyzeWithAgent(groupId)
      setAnalysis(r)
      setPanelOpen(true)
    } catch {
      showToast('Ошибка агента', 'error')
    } finally {
      setLoading(false)
    }
  }

  // ── Добавление позиции из панели агента («Забыли из чата») ───────────────────
  /** Можно ли добавлять позиции из панели агента: список открыт и есть куда класть. */
  const canAddMissing = !listLocked && categories.length > 0

  function openAddMissing(name: string) {
    if (listLocked) { showToast(LIST_LOCKED_MESSAGE, 'muted'); return }
    if (!categories.length) { showToast('Сначала создай категорию в списке', 'muted'); return }
    setAddMissingName(name)
  }

  function closeAddMissing() { setAddMissingName(null) }

  function submitAddMissing(payload: AddItemPayload) {
    if (listLocked) { showToast(LIST_LOCKED_MESSAGE, 'muted'); return }
    send({
      type: 'item:add', catId: payload.catId, name: payload.name,
      qty: payload.qty, price: 0, unit: payload.unit, kind: payload.kind,
      eventId: currentEventId ?? undefined,
    })
    setAddMissingName(null)
    showToast('Добавлено!')
  }

  function shareList() {
    let text = `🔥 ${serverState?.group?.name || 'Пикник'} — список\n\n`
    categories.forEach(cat => {
      const catItems = enabled.filter(i => i.cat_id === cat.id)
      if (!catItems.length) return
      text += `${cat.icon} ${cat.title}:\n`
      catItems.forEach(i => {
        text += `  • ${i.name} — ${i.qty} ${i.unit}`
        if (i.buyer_name) text += ` (${i.buyer_name})`
        text += '\n'
      })
      text += '\n'
    })
    if (hasBudget) text += `💰 Куплено: ${fmt(actualTotal)}\n👤 На человека (${ppl} чел.): ${fmt(perPerson ?? 0)}`
    if (navigator.share) navigator.share({ text }).catch(() => {})
    else navigator.clipboard?.writeText(text).then(() => showToast('Скопировано!'))
  }

  function copyTransfer() {
    if (!singleTransfer) return
    const text = `${singleTransfer.fromName} → ${singleTransfer.toName}: ${fmt(singleTransfer.amount)}`
    navigator.clipboard?.writeText(text).then(() => {
      showToast('Скопировано!')
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }

  return {
    // state
    events, categories, items, members, activity,
    // totals
    amIAdmin, actualTotal, boughtCount, enabledLen, pct, perPerson, ppl, enabled, catRows, hasBudget,
    // personal balance
    myTransfers, iSend, net, singleTransfer, counterparty,
    // agent
    analysis, loading, panelOpen,
    // add missing item (панель агента)
    addMissingName, canAddMissing, openAddMissing, closeAddMissing, submitAddMissing,
    // copy feedback
    copied,
    // actions
    runAnalysis, shareList, copyTransfer, setShowEventSheet, fmt,
  }
}
