import type { ReactNode } from 'react'
import { GlassCard, Divider } from '@shared/ui/GlassCard'
import {
  IconShare, IconRobot, IconAlertCircle, IconAlertTriangle, IconCheckCircle,
  IconReceipt, IconClipboard, IconChevronUp, IconChevronDown,
} from '@shared/ui/Icon'
import { CatTile } from '@entities/category/ui/CatTile'
import { ActivityFeed } from '@widgets/ActivityFeed'
import { NoEventsPrompt } from '@widgets/NoEventsPrompt'
import { useSummaryScreenVM } from './useSummaryScreenVM'

// ── StatLabel ─────────────────────────────────────────────────────────────────

function StatLabel({ children }: { children: ReactNode }) {
  return (
    <div
      className="text-[10px] font-extrabold uppercase tracking-[.1em] mb-1"
      style={{ opacity: .7 }}
    >
      {children}
    </div>
  )
}

// ── SummaryScreen ─────────────────────────────────────────────────────────────

export function SummaryScreen() {
  const vm = useSummaryScreenVM()
  const {
    events, activity, amIAdmin,
    actualTotal, boughtCount, enabledLen, pct, perPerson, ppl, catRows,
    myTransfers, iSend, net, singleTransfer, counterparty,
    analysis, loading, panelOpen,
    runAnalysis, shareList, copyTransfer, setShowEventSheet, fmt,
  } = vm

  if (!events.length) {
    return (
      <div className="px-3.5 pt-2 pb-8 relative">
        <NoEventsPrompt isAdmin={amIAdmin} onCreate={() => setShowEventSheet(true)} />
      </div>
    )
  }

  return (
    <div className="px-3.5 pt-2 pb-8 relative">

      {/* Hero */}
      <div
        className="rounded-lg p-5 mb-3"
        style={{
          background:     'linear-gradient(135deg, rgba(249,115,22,.22), rgba(245,158,11,.08))',
          border:         '1px solid rgba(249,115,22,.28)',
          backdropFilter: 'blur(24px)',
          boxShadow:      '0 12px 40px rgba(249,115,22,.12)',
        }}
      >
        {/* Куплено / На человека */}
        <div className="grid grid-cols-2 gap-3.5">

          {/* Куплено */}
          <div>
            <StatLabel>Куплено</StatLabel>
            <div className="text-display font-black tracking-tight leading-none tabular-nums">
              {actualTotal > 0 ? fmt(actualTotal) : `${enabledLen} поз.`}
            </div>
            <div className="text-[11px] mt-1" style={{ opacity: .7 }}>
              {boughtCount} из {enabledLen} позиций
            </div>
            <div
              className="mt-2 h-1.5 rounded-full overflow-hidden"
              style={{ background: 'rgba(0,0,0,.2)' }}
            >
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${pct}%`, background: 'var(--accent)' }}
              />
            </div>
          </div>

          {/* На человека */}
          <div>
            <StatLabel>На человека</StatLabel>
            <div className="text-display font-black tracking-tight leading-none tabular-nums">
              {fmt(perPerson ?? 0)}
            </div>
            <div className="text-[11px] mt-1" style={{ opacity: .7 }}>из {ppl} чел.</div>
          </div>

        </div>

        {/* Личный баланс */}
        {myTransfers.length > 0 && (
          <div
            className="mt-4 pt-3.5 flex items-center gap-3"
            style={{ borderTop: '1px solid var(--surface-white-14)' }}
          >
            <div
              className="size-[38px] rounded-[12px] flex items-center justify-center shrink-0"
              style={{
                background: iSend ? 'var(--surface-scrim-light)' : 'var(--surface-success-20)',
                color:      iSend ? 'var(--text-on-accent)'       : 'var(--green)',
              }}
            >
              {iSend
                ? <IconChevronUp   size={18} strokeWidth={2.6} />
                : <IconChevronDown size={18} strokeWidth={2.6} />}
            </div>

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

            <div className="text-[20px] font-black tracking-tight tabular-nums shrink-0">
              {fmt(Math.abs(net))}
            </div>

            {singleTransfer && (
              <button
                type="button"
                title="Скопировать"
                onClick={copyTransfer}
                className="size-[34px] rounded-[10px] flex items-center justify-center shrink-0 border-none cursor-pointer"
                style={{ background: 'var(--surface-scrim-light)', color: 'var(--text-on-accent)' }}
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
        {catRows.map(({ cat, catItems, catTotal, catDone }, i) => (
          <div key={cat.id}>
            {i > 0 && <Divider />}
            <div className="flex items-center justify-between px-[15px] py-[10px]">
              <span className="flex items-center gap-2.5 text-[13px] font-bold">
                <CatTile emoji={cat.icon} size={26} radius={7} />
                {cat.title}
                <span className="text-[11px]" style={{ color: 'var(--muted)' }}>{catDone}/{catItems.length}</span>
              </span>
              <span className="text-[13px] font-extrabold" style={{ color: catTotal > 0 ? 'var(--accent)' : 'var(--muted)' }}>
                {catTotal > 0 ? fmt(catTotal) : '—'}
              </span>
            </div>
          </div>
        ))}
      </GlassCard>

      {/* Activity feed */}
      <ActivityFeed activity={activity} />

      {/* Agent */}
      <button
        onClick={runAnalysis}
        disabled={loading}
        className="w-full py-3.5 rounded-md text-sm font-extrabold flex items-center justify-center gap-2 cursor-pointer mb-3"
        style={{
          background: 'var(--gradient-agent-panel)',
          border: '1px solid var(--border-info)',
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
          <div className="px-[16px] py-[14px] text-[13px] leading-relaxed border-b" style={{ borderColor: 'var(--gb)' }}>
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
        style={{ background: 'var(--gradient-cta)', color: 'var(--text-on-accent)', fontFamily: 'inherit' }}
      >
        <IconShare size={15} strokeWidth={2} /> Поделиться списком
      </button>
    </div>
  )
}
