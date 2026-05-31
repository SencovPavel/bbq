import { useEffect, useState } from 'react'

import { fmt } from '@shared/lib/session'
import { loadGroupUi, saveGroupUiPatch } from '@shared/lib/ui-persist'
import { analyzeWithAgent } from '@shared/api/api'
import { calcSummary } from '@shared/lib/summary'
import { calcSettlement } from '@shared/lib/settlement'

import { useWsStore } from '../stores/wsStore'
import { useSessionStore } from '../stores/sessionStore'
import { useAppStore } from '../stores/appStore'
import { useToastStore } from '../stores/toastStore'

import type { AnalysisResult } from '@shared/types'

export function useSummaryScreenVM() {
  const serverState       = useWsStore(s => s.serverState)
  const groupId           = useSessionStore(s => s.groupId)
  const me                = useSessionStore(s => s.me)
  const showToast         = useToastStore(s => s.show)
  const currentEventId    = useAppStore(s => s.currentEventId)
  const setShowEventSheet = useAppStore(s => s.setShowEventSheet)

  const [analysis,  setAnalysis]  = useState<AnalysisResult | null>(null)
  const [loading,   setLoading]   = useState(false)
  const [panelOpen, setPanelOpen] = useState(false)

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
  const { categories = [], items = [], members = [], events = [], activity = [] } = serverState ?? {}
  const amIAdmin = members.some(m => m.user_id === me?.id && m.is_admin)
  const { actualTotal, boughtCount, enabledCount: enabledLen, pct, perPerson } = calcSummary(items, members, currentEventId)
  const { transfers } = calcSettlement(items, members, currentEventId)
  const enabled = currentEventId
    ? items.filter(i => i.event_id === currentEventId && i.enabled)
    : items.filter(i => i.enabled)
  const ppl = members.length

  // ── Personal balance ─────────────────────────────────────────────────────────
  const myTransfers    = transfers.filter(t => t.fromId === me?.id || t.toId === me?.id)
  const iSendTotal     = myTransfers.filter(t => t.fromId === me?.id).reduce((s, t) => s + t.amount, 0)
  const iGetTotal      = myTransfers.filter(t => t.toId   === me?.id).reduce((s, t) => s + t.amount, 0)
  const net            = iGetTotal - iSendTotal   // >0 — get back, <0 — must send
  const iSend          = net < 0
  const singleTransfer = myTransfers.length === 1 ? myTransfers[0] : null
  const counterparty   = singleTransfer
    ? (singleTransfer.fromId === me?.id ? singleTransfer.toName : singleTransfer.fromName)
    : null

  // ── Per-category totals ──────────────────────────────────────────────────────
  const catRows = categories
    .map(cat => {
      const catItems  = enabled.filter(x => x.cat_id === cat.id)
      const catBought = catItems.filter(x => x.bought && x.price > 0)
      const catTotal  = catBought.reduce((s, x) => s + x.price * x.qty, 0)
      const catDone   = catItems.filter(x => x.bought).length
      return { cat, catItems, catTotal, catDone }
    })
    .filter(r => r.catItems.length > 0)

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
    text += `💰 Куплено: ${fmt(actualTotal)}\n👤 На человека (${ppl} чел.): ${fmt(perPerson ?? 0)}`
    if (navigator.share) navigator.share({ text }).catch(() => {})
    else navigator.clipboard?.writeText(text).then(() => showToast('Скопировано!'))
  }

  function copyTransfer() {
    if (!singleTransfer) return
    const text = `${singleTransfer.fromName} → ${singleTransfer.toName}: ${fmt(singleTransfer.amount)}`
    navigator.clipboard?.writeText(text).then(() => showToast('Скопировано!'))
  }

  return {
    // state
    events, categories, items, members, activity,
    // totals
    amIAdmin, actualTotal, boughtCount, enabledLen, pct, perPerson, ppl, enabled, catRows,
    // personal balance
    myTransfers, iSend, net, singleTransfer, counterparty,
    // agent
    analysis, loading, panelOpen,
    // actions
    runAnalysis, shareList, copyTransfer, setShowEventSheet, fmt,
  }
}
