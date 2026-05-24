import { useState } from 'react'
import { GlassCard, Divider } from '../components/GlassCard'
import { fmt } from '../lib/session'
import { analyzeWithAgent } from '../lib/api'
import { useWsStore } from '../stores/wsStore'
import { useSessionStore } from '../stores/sessionStore'
import { useAppStore } from '../stores/appStore'
import { useToastStore } from '../stores/toastStore'
import { IconShare, IconCalendar, IconRobot, IconAlertCircle, IconAlertTriangle, IconCheckCircle } from '../components/Icon'
import type { AnalysisResult } from '../types'

export function SummaryScreen() {
  const serverState    = useWsStore(s => s.serverState)
  const groupId        = useSessionStore(s => s.groupId)
  const showToast      = useToastStore(s => s.show)
  const currentEventId = useAppStore(s => s.currentEventId)

  const [analysis,  setAnalysis]  = useState<AnalysisResult | null>(null)
  const [loading,   setLoading]   = useState(false)
  const [panelOpen, setPanelOpen] = useState(false)

  const { categories = [], items = [], members = [] } = serverState ?? {}
  const allItems    = currentEventId ? items.filter(i => i.event_id === currentEventId) : items
  const enabled     = allItems.filter(i => i.enabled)
  const bought      = enabled.filter(i => i.bought && i.price > 0)
  const actualTotal = bought.reduce((s, i) => s + i.price * i.qty, 0)
  const boughtCount = enabled.filter(i => i.bought).length
  const pct         = enabled.length ? Math.round(boughtCount / enabled.length * 100) : 0
  const ppl         = members.length

  async function runAnalysis() {
    if (!groupId) return
    setLoading(true)
    setPanelOpen(false)
    try {
      const r = await analyzeWithAgent(groupId)
      setAnalysis(r)
      setPanelOpen(true)
    } catch {
      showToast('Ошибка агента', 'var(--red)')
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
    text += `💰 Куплено: ${fmt(actualTotal)}\n👤 На человека (${ppl} чел.): ${fmt(ppl ? actualTotal / ppl : 0)}`
    if (navigator.share) navigator.share({ text }).catch(() => {})
    else navigator.clipboard?.writeText(text).then(() => showToast('Скопировано!'))
  }

  return (
    <div className="px-[14px] pt-2 pb-8 relative z-10">
      {/* Hero */}
      <div className="rounded-[20px] p-[22px] mb-3 grid grid-cols-2 gap-[14px]"
        style={{ background: 'linear-gradient(135deg,rgba(249,115,22,.22),rgba(251,191,36,.12))',
                 border: '1px solid rgba(249,115,22,.28)', backdropFilter: 'blur(20px)' }}>
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[.08em] mb-[5px]" style={{ opacity: .65 }}>Куплено</div>
          <div className="text-[26px] font-black tracking-tight">
            {bought.length > 0 ? fmt(actualTotal) : `${enabled.length} поз.`}
          </div>
          <div className="text-[11px] mt-[3px]" style={{ opacity: .65 }}>
            {boughtCount} из {enabled.length} позиций
          </div>
          <div className="h-[5px] rounded-full mt-[8px] overflow-hidden" style={{ background: 'rgba(255,255,255,.15)' }}>
            <div className="h-full rounded-full transition-all duration-500"
              style={{ width: `${pct}%`, background: 'linear-gradient(90deg,var(--accent),var(--green))' }} />
          </div>
        </div>
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[.08em] mb-[5px]" style={{ opacity: .65 }}>На человека</div>
          <div className="text-[26px] font-black tracking-tight">
            {ppl > 0 && bought.length > 0 ? fmt(actualTotal / ppl) : '—'}
          </div>
          <div className="text-[11px] mt-[3px]" style={{ opacity: .65 }}>из {ppl} чел.</div>
        </div>
      </div>

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

      {/* Agent */}
      <button onClick={runAnalysis} disabled={loading}
        className="w-full py-[14px] rounded-[14px] text-[14px] font-extrabold flex items-center justify-center gap-2 cursor-pointer border-none mb-3"
        style={{ background: 'var(--g)', border: '1px solid var(--gb)', color: 'var(--text)',
                 opacity: loading ? .6 : 1, fontFamily: 'inherit' }}>
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

      <button onClick={shareList}
        className="w-full py-[15px] rounded-[14px] border-none text-[14px] font-extrabold cursor-pointer"
        style={{ background: 'linear-gradient(90deg,var(--accent),var(--accent2))', color: '#fff', fontFamily: 'inherit' }}>
        <IconShare size={15} strokeWidth={2} /> Поделиться списком
      </button>
    </div>
  )
}
