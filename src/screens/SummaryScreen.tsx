import { useId, type ReactNode } from 'react'
import { GlassCard, Divider } from '@shared/ui/GlassCard'
import {
  IconShare, IconRobot, IconAlertCircle, IconAlertTriangle, IconCheckCircle,
  IconReceipt, IconClipboard, IconCheck, IconChevronUp, IconChevronDown, IconPlus,
} from '@shared/ui/Icon'
import { CatTile } from '@entities/category/ui/CatTile'
import { ActivityFeed } from '@widgets/ActivityFeed'
import { NoEventsPrompt } from '@widgets/NoEventsPrompt'
import { AddItemModal } from '@widgets/AddItemModal'
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

interface ReadyRingProps {
  pct: number
  done: number
  total: number
  size?: number
  sw?: number
}

function ReadyRing({ pct, done, total, size = 60, sw = 6 }: ReadyRingProps) {
  const gradId = `ready-grad-${useId().replace(/:/g, '')}`
  const r = (size - sw) / 2
  const c = 2 * Math.PI * r
  const half = size / 2

  return (
    <div className="relative flex items-center justify-center shrink-0">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="shrink-0"
        style={{ transform: 'rotate(-90deg)' }}
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="var(--accent)" />
            <stop offset="1" stopColor="var(--green)" />
          </linearGradient>
        </defs>
        <circle
          cx={half}
          cy={half}
          r={r}
          fill="none"
          stroke="rgba(0,0,0,.25)"
          strokeWidth={sw}
        />
        <circle
          cx={half}
          cy={half}
          r={r}
          fill="none"
          stroke={`url(#${gradId})`}
          strokeWidth={sw}
          strokeLinecap="round"
          strokeDasharray={`${(c * pct) / 100} ${c}`}
          className="transition-all duration-500"
        />
      </svg>
      <div className="absolute text-center leading-none">
        <div className="text-[14px] font-black tabular-nums">
          {done}<span className="opacity-50 text-[11px]">/{total}</span>
        </div>
        <div
          className="text-[7px] font-extrabold uppercase tracking-[.08em] mt-0.5"
          style={{ opacity: 0.55 }}
        >
          куплено
        </div>
      </div>
    </div>
  )
}

// ── SummaryScreen ─────────────────────────────────────────────────────────────

export function SummaryScreen() {
  const vm = useSummaryScreenVM()
  const {
    events, activity, amIAdmin, categories,
    actualTotal, boughtCount, enabledLen, pct, perPerson, ppl, catRows, hasBudget,
    myTransfers, iSend, net, singleTransfer, counterparty,
    analysis, loading, panelOpen, copied,
    addMissingName, canAddMissing, openAddMissing, closeAddMissing, submitAddMissing,
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
          background:     'var(--gradient-hero-summary)',
          border:         '1px solid var(--surface-fire-28)',
          backdropFilter: 'blur(24px)',
          boxShadow:      '0 12px 40px var(--surface-fire-12)',
        }}
      >
        {/* Готовность + суммы */}
        <div className="flex items-center gap-4">
          <ReadyRing pct={pct} done={boughtCount} total={enabledLen} />
          <div className="flex-1 min-w-0">
            <StatLabel>{hasBudget ? 'Куплено' : 'Готово'}</StatLabel>
            <div className="text-display font-black tracking-tight leading-none tabular-nums whitespace-nowrap">
              {hasBudget && actualTotal > 0 ? fmt(actualTotal) : `${enabledLen} поз.`}
            </div>
            {hasBudget && (
              <div className="text-[11px] mt-[5px]" style={{ opacity: 0.7 }}>
                На человека ·{' '}
                <b className="font-extrabold" style={{ opacity: 0.95 }}>
                  {fmt(perPerson ?? 0)}
                </b>
                {' '}· {ppl} чел.
              </div>
            )}
          </div>
        </div>

        {/* Личный баланс */}
        {hasBudget && myTransfers.length > 0 && (
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
                className="size-[34px] rounded-[10px] flex items-center justify-center shrink-0 border-none cursor-pointer transition-colors duration-200"
                style={{
                  background: copied ? 'var(--surface-success-20)' : 'var(--surface-scrim-light)',
                  color: copied ? 'var(--green)' : 'var(--text-on-accent)',
                }}
              >
                {copied ? <IconCheck size={14} strokeWidth={2.4} /> : <IconClipboard size={14} />}
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
              {hasBudget && (
                <span className="text-[13px] font-extrabold" style={{ color: catTotal > 0 ? 'var(--accent)' : 'var(--muted)' }}>
                  {catTotal > 0 ? fmt(catTotal) : '—'}
                </span>
              )}
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
        {loading ? 'Анализирую...' : (analysis ? 'Обновить анализ' : 'Проверить с агентом')}
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
                  <div className="flex-1 min-w-0">
                    <div className="font-bold">{m.name}</div>
                    {m.hint && <div style={{ color: 'var(--muted)' }}>"{m.hint}"</div>}
                  </div>
                  {canAddMissing && (
                    <button
                      type="button"
                      title="Добавить в список"
                      aria-label={`Добавить «${m.name}» в список`}
                      onClick={() => openAddMissing(m.name)}
                      className="shrink-0 h-[26px] px-2 rounded-[9px] text-[11px] font-extrabold flex items-center gap-1 cursor-pointer"
                      style={{
                        background: 'var(--surface-fire-12)',
                        border: '1px solid var(--accent)',
                        color: 'var(--accent)',
                        fontFamily: 'inherit',
                      }}
                    >
                      <IconPlus size={11} strokeWidth={2.4} /> Добавить
                    </button>
                  )}
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

      {/* Добавление позиции из панели агента */}
      <AddItemModal
        open={addMissingName !== null}
        initialName={addMissingName ?? ''}
        categories={categories}
        onClose={closeAddMissing}
        onSubmit={submitAddMissing}
      />
    </div>
  )
}
