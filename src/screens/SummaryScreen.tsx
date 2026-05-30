import { useEffect, useState } from 'react'
import { GlassCard, Divider } from '../components/GlassCard'
import { fmt } from '../lib/session'
import { loadGroupUi, saveGroupUiPatch } from '../lib/ui-persist'
import { analyzeWithAgent } from '../lib/api'
import { calcSummary } from '../lib/summary'
import { useWsStore } from '../stores/wsStore'
import { useSessionStore } from '../stores/sessionStore'
import { useAppStore } from '../stores/appStore'
import { useToastStore } from '../stores/toastStore'
import { NoEventsPrompt } from '../components/NoEventsPrompt'
import { OfflineBanner } from '../components/states/OfflineBanner'
import {
  IconShare, IconRobot, IconAlertCircle, IconAlertTriangle, IconCheckCircle,
  IconReceipt, IconClipboard, IconChevronUp, IconChevronDown,
} from '../components/Icon'
import { calcSettlement } from '../lib/settlement'
import { ActivityFeed } from '../components/ActivityFeed'
import type { AnalysisResult } from '../types'

export function SummaryScreen() {
  const serverState    = useWsStore(s => s.serverState)
  const wsOk           = useWsStore(s => s.wsOk)
  const groupId        = useSessionStore(s => s.groupId)
  const showToast      = useToastStore(s => s.show)
  const currentEventId    = useAppStore(s => s.currentEventId)
  const setShowEventSheet = useAppStore(s => s.setShowEventSheet)

  const [analysis,  setAnalysis]  = useState<AnalysisResult | null>(null)
  const [loading,   setLoading]   = useState(false)
  const [panelOpen, setPanelOpen] = useState(false)

  useEffect(() => {
    if (!groupId) return
    setPanelOpen(loadGroupUi(groupId).summaryPanelOpen)
  }, [groupId])

  useEffect(() => {
    if (!groupId) return
    saveGroupUiPatch(groupId, { summaryPanelOpen: panelOpen })
  }, [groupId, panelOpen])

  const me = useSessionStore(s => s.me)

  const { categories = [], items = [], members = [], events = [], activity = [] } = serverState ?? {}
  const amIAdmin = members.some(m => m.user_id === me?.id && m.is_admin)
  const { actualTotal, boughtCount, enabledCount: enabledLen, pct, perPerson } = calcSummary(items, members, currentEventId)
  const { transfers } = calcSettlement(items, members, currentEventId)
  const enabled = currentEventId ? items.filter(i => i.event_id === currentEventId && i.enabled) : items.filter(i => i.enabled)
  const ppl     = members.length

  // ── Личный баланс ─────────────────────────────────────────────────────────
  const myTransfers    = transfers.filter(t => t.fromId === me?.id || t.toId === me?.id)
  const iSendTotal     = myTransfers.filter(t => t.fromId === me?.id).reduce((s, t) => s + t.amount, 0)
  const iGetTotal      = myTransfers.filter(t => t.toId   === me?.id).reduce((s, t) => s + t.amount, 0)
  const net            = iGetTotal - iSendTotal   // >0 — вернут, <0 — перевести
  const iSend          = net < 0
  const singleTransfer = myTransfers.length === 1 ? myTransfers[0] : null
  const counterparty   = singleTransfer
    ? (singleTransfer.fromId === me?.id ? singleTransfer.toName : singleTransfer.fromName)
    : null

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

  if (!events.length) {
    return (
      <div className="px-3.5 pt-2 pb-8 relative">
        {!wsOk && <OfflineBanner />}
        <NoEventsPrompt isAdmin={amIAdmin} onCreate={() => setShowEventSheet(true)} />
      </div>
    )
  }

  return (
    <div className="px-3.5 pt-2 pb-8 relative">
      {!wsOk && <OfflineBanner />}

      {/* Hero */}
      <div
        className="rounded-[20px] p-[22px] mb-3"
        style={{
          background: 'linear-gradient(135deg,rgba(249,115,22,.22),rgba(251,191,36,.12))',
          border: '1px solid rgba(249,115,22,.28)',
          backdropFilter: 'blur(20px)',
        }}
      >
        {/* Куплено / На человека */}
        <div className="grid grid-cols-2 gap-[14px]">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[.08em] mb-[5px]" style={{ opacity: .65 }}>Куплено</div>
            <div className="text-[26px] font-black tracking-tight">
              {actualTotal > 0 ? fmt(actualTotal) : `${enabledLen} поз.`}
            </div>
            <div className="text-[11px] mt-[3px]" style={{ opacity: .65 }}>
              {boughtCount} из {enabledLen} позиций
            </div>
            <div className="h-[5px] rounded-full mt-[8px] overflow-hidden" style={{ background: 'rgba(255,255,255,.15)' }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${pct}%`, background: 'linear-gradient(90deg,var(--accent),var(--green))' }}
              />
            </div>
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[.08em] mb-[5px]" style={{ opacity: .65 }}>На человека</div>
            <div className="text-[26px] font-black tracking-tight">
              {perPerson !== null ? fmt(perPerson) : '—'}
            </div>
            <div className="text-[11px] mt-[3px]" style={{ opacity: .65 }}>из {ppl} чел.</div>
          </div>
        </div>

        {/* Личный баланс — полная ширина под двумя колонками */}
        {myTransfers.length > 0 && (
          <div
            className="mt-4 pt-3.5 flex items-center gap-3"
            style={{ borderTop: '1px solid rgba(255,255,255,.14)' }}
          >
            {/* Иконка направления */}
            <div
              className="size-[38px] rounded-[12px] flex items-center justify-center shrink-0"
              style={{
                background: iSend ? 'rgba(0,0,0,.22)' : 'rgba(74,222,128,.2)',
                color:      iSend ? '#fff'            : 'var(--green)',
              }}
            >
              {iSend
                ? <IconChevronUp   size={18} strokeWidth={2.6} />
                : <IconChevronDown size={18} strokeWidth={2.6} />}
            </div>

            {/* Подпись + контрагент */}
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-extrabold uppercase tracking-[.1em]" style={{ opacity: .7 }}>
                {iSend ? 'Тебе перевести' : 'Тебе вернут'}
              </div>
              <div className="text-[15px] font-extrabold mt-0.5 truncate">
                {singleTransfer
                  ? (iSend ? `→ ${counterparty}` : `← ${counterparty}`)
                  : `${myTransfers.length} перевода`}
              </div>
            </div>

            {/* Нетто-сумма */}
            <div className="text-[20px] font-black tracking-tight tabular-nums shrink-0">
              {fmt(Math.abs(net))}
            </div>

            {/* Копировать — только при одном переводе */}
            {singleTransfer && (
              <button
                type="button"
                title="Скопировать"
                onClick={() => {
                  const text = `${singleTransfer.fromName} → ${singleTransfer.toName}: ${fmt(singleTransfer.amount)}`
                  navigator.clipboard?.writeText(text).then(() => showToast('Скопировано!'))
                }}
                className="size-[34px] rounded-[10px] flex items-center justify-center shrink-0 border-none cursor-pointer"
                style={{ background: 'rgba(0,0,0,.22)', color: '#fff' }}
              >
                <IconClipboard size={14} />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Empty state */}
      {enabledLen === 0 && (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div style={{ color: 'var(--muted)', opacity: 0.35, marginBottom: 14 }}><IconReceipt size={52} /></div>
          <div className="text-[16px] font-extrabold mb-[6px]">Список пустой</div>
          <div className="text-[13px] leading-relaxed" style={{ color: 'var(--muted)', maxWidth: 220 }}>
            Перейди в «Список» и добавь что нужно купить
          </div>
        </div>
      )}

      {/* Category rows */}
      <GlassCard>
        {categories.map((cat, i) => {
          const catItems  = enabled.filter(x => x.cat_id === cat.id)
          if (!catItems.length) return null
          const catBought = catItems.filter(x => x.bought && x.price > 0)
          const catTotal  = catBought.reduce((s, x) => s + x.price * x.qty, 0)
          const catDone   = catItems.filter(x => x.bought).length
          return (
            <div key={cat.id}>
              {i > 0 && <Divider />}
              <div className="flex items-center justify-between px-[15px] py-[10px]">
                <span className="text-[13px] font-bold">
                  {cat.icon} {cat.title}
                  <span className="text-[11px] ml-[6px]" style={{ color: 'var(--muted)' }}>{catDone}/{catItems.length}</span>
                </span>
                <span className="text-[13px] font-extrabold" style={{ color: catTotal > 0 ? 'var(--accent)' : 'var(--muted)' }}>
                  {catTotal > 0 ? fmt(catTotal) : '—'}
                </span>
              </div>
            </div>
          )
        })}
      </GlassCard>

      {/* Activity feed */}
      <ActivityFeed activity={activity} />

      {/* Agent */}
      <button
        onClick={runAnalysis}
        disabled={loading}
        className="w-full py-3.5 rounded-md text-sm font-extrabold flex items-center justify-center gap-2 cursor-pointer mb-3"
        style={{
          background: 'linear-gradient(90deg, rgba(96,165,250,.1), rgba(167,139,250,.08))',
          border: '1px solid rgba(96,165,250,.25)',
          color: 'var(--text)',
          opacity: loading ? 0.6 : 1,
          fontFamily: 'inherit',
        }}
      >
        <IconRobot size={15} />
        {loading ? 'Анализирую...' : 'Проверить с агентом'}
      </button>

      {panelOpen && analysis && (
        <GlassCard>
          <div className="px-[16px] py-[14px] text-[13px] leading-relaxed border-b"
            style={{ borderColor: 'var(--gb)' }}>
            {analysis.summary}
          </div>

          {(analysis.missing?.length ?? 0) > 0 && (
            <div className="px-[16px] py-[10px] border-b" style={{ borderColor: 'var(--gb)' }}>
              <div className="flex items-center gap-[5px] text-[10px] font-extrabold uppercase tracking-[.08em] mb-2" style={{ color: 'var(--red)' }}>
                <IconAlertCircle size={11} strokeWidth={2.2} /> Забыли из чата
              </div>
              {analysis.missing!.map((m, i) => (
                <div key={i} className="flex items-start gap-2 py-[6px] text-[12px] border-b last:border-none" style={{ borderColor: 'var(--gb)' }}>
                  <span style={{ color: 'var(--red)', marginTop: 1 }}><IconAlertCircle size={13} /></span>
                  <div className="flex-1">
                    <div className="font-bold">{m.name}</div>
                    {m.hint && <div style={{ color: 'var(--muted)' }}>"{m.hint}"</div>}
                  </div>
                </div>
              ))}
            </div>
          )}

          {(analysis.changed?.length ?? 0) > 0 && (
            <div className="px-[16px] py-[10px] border-b" style={{ borderColor: 'var(--gb)' }}>
              <div className="flex items-center gap-[5px] text-[10px] font-extrabold uppercase tracking-[.08em] mb-2" style={{ color: 'var(--blue)' }}>
                <IconAlertTriangle size={11} strokeWidth={2.2} /> Количество отличается
              </div>
              {analysis.changed!.map((c, i) => (
                <div key={i} className="flex items-start gap-2 py-[6px] text-[12px] border-b last:border-none" style={{ borderColor: 'var(--gb)' }}>
                  <span style={{ color: 'var(--blue)', marginTop: 1 }}><IconAlertTriangle size={13} /></span>
                  <div>
                    <div className="font-bold">{c.name}</div>
                    <div style={{ color: 'var(--muted)' }}>В чате: {c.chat_qty} · В списке: {c.list_qty}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!analysis.missing?.length && !analysis.changed?.length && (
            <div className="py-4 text-center text-[13px] font-extrabold flex items-center justify-center gap-[6px]" style={{ color: 'var(--green)' }}>
              <IconCheckCircle size={15} strokeWidth={2.2} /> Список соответствует обсуждению
            </div>
          )}
        </GlassCard>
      )}

      <button
        onClick={shareList}
        className="w-full py-[15px] rounded-[14px] border-none text-[14px] font-extrabold cursor-pointer flex items-center justify-center gap-2"
        style={{ background: 'linear-gradient(90deg,var(--accent),var(--accent2))', color: '#fff', fontFamily: 'inherit' }}
      >
        <IconShare size={15} strokeWidth={2} /> Поделиться списком
      </button>
    </div>
  )
}
