import { type ReactNode, useState } from 'react'

import { Divider } from '../components/GlassCard'
import { CollapseSection } from '../components/CollapseSection'
import { ConfirmModal } from '../components/ConfirmModal'
import { EventDescriptionModal } from '../components/EventDescriptionModal'
import { EventEditModal } from '../components/EventEditModal'
import { NoEventsPrompt } from '../components/NoEventsPrompt'
import {
  IconCalendar,
  IconChevronRight,
  IconClock,
  IconClipboard,
  IconCrown,
  IconFlag,
  IconLogOut,
  IconMapPin,
  IconPencil,
  IconShare,
  IconShield,
  IconX,
} from '../components/Icon'
import { fmt, clearGroupSession } from '../lib/session'
import { shortDate } from '../lib/format'
import { canAdminCompleteEvent, isEventActive } from '../lib/event-status'
import { sendEventUpdates } from '../lib/event-update'
import { useWsStore } from '../stores/wsStore'
import { useSessionStore } from '../stores/sessionStore'
import { useAppStore } from '../stores/appStore'
import { useToastStore } from '../stores/toastStore'

import type { PicnicEvent } from '../types'

// ── helpers ────────────────────────────────────────────────────────────────────

/** Целых дней от сегодня до dateStr (< 0 — в прошлом) */
function daysUntil(dateStr: string | null): number | null {
  if (!dateStr) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(dateStr + 'T00:00:00')
  return Math.round((target.getTime() - today.getTime()) / 86_400_000)
}

function pluralDays(n: number): string {
  if (n === 1) return 'день'
  if (n >= 2 && n <= 4) return 'дня'
  return 'дней'
}

// ── MetaChip ──────────────────────────────────────────────────────────────────

function MetaChip({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-pill text-xs font-bold"
      style={{ background: 'rgba(16,14,11,.28)', border: '1px solid rgba(255,255,255,.1)' }}
    >
      {icon}
      {children}
    </span>
  )
}

// ── EventScreen ───────────────────────────────────────────────────────────────

export function EventScreen() {
  const serverState = useWsStore(s => s.serverState)
  const send        = useWsStore(s => s.send)
  const resetWs     = useWsStore(s => s.reset)
  const me          = useSessionStore(s => s.me)
  const setGroupId  = useSessionStore(s => s.setGroupId)
  const setScreen   = useAppStore(s => s.setScreen)
  const setTab      = useAppStore(s => s.setTab)
  const exitEvent   = useAppStore(s => s.exitEvent)
  const setShowEventSheet = useAppStore(s => s.setShowEventSheet)
  const currentEventId = useAppStore(s => s.currentEventId)
  const showToast   = useToastStore(s => s.show)

  const [copied, setCopied] = useState(false)
  const [confirmKick, setConfirmKick] = useState<{ userId: string; name: string } | null>(null)
  const [confirmDemote, setConfirmDemote] = useState<{ userId: string; name: string } | null>(null)
  const [confirmLeave, setConfirmLeave] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [confirmComplete, setConfirmComplete] = useState(false)
  const [showDescriptionEdit, setShowDescriptionEdit] = useState(false)
  const [showEventEdit, setShowEventEdit] = useState(false)

  const { members = [], items = [], group, events = [] } = serverState ?? {}
  const currentEvent = currentEventId ? events.find(e => e.id === currentEventId) : undefined
  const amIAdmin = members.find(m => m.user_id === me?.id)?.is_admin ?? false
  const canCompleteEvent = canAdminCompleteEvent(amIAdmin, currentEvent)

  // ── Countdown ────────────────────────────────────────────────────────────────
  const daysLeft = daysUntil(currentEvent?.event_date ?? null)

  const countdownLabel =
    daysLeft === null ? null :
    daysLeft < 0     ? 'Прошло' :
    daysLeft === 0   ? 'Сегодня' :
    daysLeft === 1   ? 'Завтра' :
    `Через ${daysLeft} ${pluralDays(daysLeft)}`

  const urgency =
    daysLeft === null || daysLeft < 0
      ? { dot: 'var(--muted)',    text: 'var(--muted)',    border: 'rgba(255,255,255,.14)', glow: 'none' }
    : daysLeft <= 1
      ? { dot: 'var(--red)',      text: 'var(--red)',      border: 'rgba(248,113,113,.4)',  glow: '0 0 8px rgba(248,113,113,.7)' }
    : daysLeft <= 4
      ? { dot: 'var(--accent-2)', text: 'var(--accent-2)', border: 'rgba(251,191,36,.4)',   glow: '0 0 8px rgba(251,191,36,.7)' }
      : { dot: '#4ade80',         text: '#4ade80',         border: 'rgba(74,222,128,.38)',  glow: '0 0 8px rgba(74,222,128,.6)' }

  // ── Readiness ring ───────────────────────────────────────────────────────────
  const evItems    = currentEventId ? items.filter(i => i.event_id === currentEventId && i.enabled) : []
  const evBought   = evItems.filter(i => i.bought)
  const readyPct   = evItems.length ? Math.round(evBought.length / evItems.length * 100) : 0
  const readyColor = readyPct === 100 ? '#4ade80' : 'var(--accent-2)'
  // circumference for r=15: 2π×15 ≈ 94.25
  const C = 94.25

  // ── Member spend ─────────────────────────────────────────────────────────────
  const eventItems = currentEventId ? items.filter(i => i.event_id === currentEventId) : items

  // ── Handlers ──────────────────────────────────────────────────────────────────

  const handleCompleteEvent = () => {
    if (!currentEvent) return
    send({ type: 'event:complete', id: currentEvent.id })
    exitEvent()
    showToast(`Событие «${currentEvent.name}» завершено`)
    setConfirmComplete(false)
  }

  const handleSaveDescription = (description: string | null) => {
    if (!currentEvent) return
    sendEventUpdates(send, currentEvent.id, { description })
    showToast('Заметки сохранены')
    setShowDescriptionEdit(false)
  }

  const handleSaveEvent = (data: Partial<Pick<PicnicEvent, 'name' | 'event_date' | 'event_time' | 'location'>>) => {
    if (!currentEvent) return
    sendEventUpdates(send, currentEvent.id, data)
    showToast('Событие обновлено')
    setShowEventEdit(false)
  }

  const copyCode = () => {
    const code = group?.invite_code
    if (!code) return
    navigator.clipboard?.writeText(code).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
    showToast('Код скопирован: ' + code)
  }

  const shareCode = () => {
    const code = group?.invite_code
    if (!code) return
    const text = `Присоединяйся к «${group?.name}» в Котёл! Код: ${code}`
    if (navigator.share) {
      navigator.share({ text }).catch(() => {})
    } else {
      navigator.clipboard?.writeText(text).catch(() => {})
      showToast('Приглашение скопировано')
    }
  }

  const navigateToGroups = () => {
    clearGroupSession()
    setGroupId(null)
    resetWs()
    exitEvent()
    setShowEventSheet(false)
    setScreen('groups')
  }

  // ── Guard ─────────────────────────────────────────────────────────────────────

  if (!events.length) {
    return (
      <div className="px-3.5 pt-2 pb-8 relative">
        <NoEventsPrompt isAdmin={amIAdmin} onCreate={() => setShowEventSheet(true)} />
      </div>
    )
  }

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div className="px-3.5 pt-2 pb-8 relative">

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <div
        className="rounded-lg p-5 mb-3.5 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(249,115,22,.18), rgba(251,191,36,.06))',
          border: '1px solid rgba(249,115,22,.25)',
          backdropFilter: 'blur(24px)',
        }}
      >
        {/* Декоративное свечение */}
        <div
          className="pointer-events-none absolute -top-8 -right-8 size-36 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(251,191,36,.18), transparent 65%)' }}
        />

        <div className="relative">
          {/* Строка 1: countdown + кнопки */}
          <div className="flex items-center justify-between gap-2 mb-3">
            {countdownLabel ? (
              <div
                className="inline-flex items-center gap-1.5 h-8 px-3 rounded-pill"
                style={{ background: 'rgba(16,14,11,.35)', border: `1px solid ${urgency.border}` }}
              >
                <span
                  className="size-1.5 rounded-full shrink-0"
                  style={{ background: urgency.dot, boxShadow: urgency.glow }}
                />
                <span className="text-xs font-black tracking-tight" style={{ color: urgency.text }}>
                  {countdownLabel}
                </span>
              </div>
            ) : <span />}

            {amIAdmin && currentEvent && (
              <div className="flex items-center gap-1.5 shrink-0">
                {canCompleteEvent && (
                  <button
                    type="button"
                    onClick={() => setConfirmComplete(true)}
                    title="Завершить событие"
                    className="size-8 rounded-[9px] flex items-center justify-center border cursor-pointer"
                    style={{
                      background: 'rgba(34,197,94,.12)',
                      borderColor: 'rgba(34,197,94,.35)',
                      color: '#4ade80',
                      fontFamily: 'inherit',
                    }}
                  >
                    <IconFlag size={15} strokeWidth={2} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowEventEdit(true)}
                  title="Редактировать событие"
                  className="size-8 rounded-[9px] flex items-center justify-center border cursor-pointer"
                  style={{
                    background: 'rgba(251,191,36,.12)',
                    borderColor: 'rgba(251,191,36,.3)',
                    color: 'var(--accent-2)',
                    fontFamily: 'inherit',
                  }}
                >
                  <IconPencil size={13} />
                </button>
              </div>
            )}
          </div>

          {/* Название */}
          <div className="text-xl font-black tracking-tight mb-3">
            {currentEvent?.name ?? 'Событие не выбрано'}
          </div>

          {/* Мета-чипы */}
          {currentEvent && (
            <div className="flex items-center gap-1.5 flex-wrap mb-4">
              <MetaChip icon={<IconCalendar size={12} strokeWidth={2} />}>
                {currentEvent.event_date ? shortDate(currentEvent.event_date) : 'Дата не указана'}
              </MetaChip>
              {currentEvent.event_time && (
                <MetaChip icon={<IconClock size={12} strokeWidth={2} />}>
                  {currentEvent.event_time.slice(0, 5)}
                </MetaChip>
              )}
              {currentEvent.location && (
                <MetaChip icon={<IconMapPin size={11} strokeWidth={2} />}>
                  {currentEvent.location}
                </MetaChip>
              )}
            </div>
          )}

          {/* Кольцо готовности */}
          {currentEvent && (
            <div
              className="flex items-center gap-3 pt-3.5"
              style={{ borderTop: '1px solid rgba(255,255,255,.12)' }}
            >
              <svg
                width="40" height="40" viewBox="0 0 36 36"
                className="shrink-0"
                style={{ transform: 'rotate(-90deg)' }}
              >
                <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(255,255,255,.12)" strokeWidth="4" />
                <circle
                  cx="18" cy="18" r="15" fill="none"
                  stroke={readyColor} strokeWidth="4" strokeLinecap="round"
                  strokeDasharray={`${readyPct / 100 * C} ${C}`}
                />
              </svg>
              <div className="flex-1 min-w-0">
                <div className="text-[15px] font-black tabular-nums" style={{ color: readyColor }}>
                  Готово {readyPct}%
                </div>
                <div className="text-[11.5px] font-semibold mt-px" style={{ color: 'var(--muted)' }}>
                  {evItems.length > 0
                    ? `Куплено ${evBought.length} из ${evItems.length} позиций`
                    : 'Список пока пуст'}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setTab('list')}
                className="inline-flex items-center gap-1 px-3 py-[7px] rounded-pill text-xs font-extrabold shrink-0 cursor-pointer border-none"
                style={{
                  background: 'rgba(16,14,11,.35)',
                  border: '1px solid rgba(255,255,255,.12)',
                  color: 'var(--text)',
                  fontFamily: 'inherit',
                }}
              >
                К списку <IconChevronRight size={12} strokeWidth={2.5} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Заметки ──────────────────────────────────────────────────────────── */}
      {currentEvent && (
        <>
          <CollapseSection
            title="Заметки"
            defaultOpen
            action={amIAdmin ? (
              <button
                type="button"
                onClick={() => setShowDescriptionEdit(true)}
                className="inline-flex items-center gap-1 text-[11px] font-bold border-none bg-transparent cursor-pointer"
                style={{ color: 'var(--accent)', fontFamily: 'inherit' }}
              >
                <IconPencil size={12} />
                {currentEvent.description ? 'Изменить' : 'Добавить'}
              </button>
            ) : undefined}
          >
            <div className="px-3.5 py-3">
              {currentEvent.description ? (
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{currentEvent.description}</p>
              ) : (
                <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>
                  {amIAdmin
                    ? 'Добавьте заметки — место, что взять с собой, договорённости…'
                    : 'Заметок пока нет'}
                </p>
              )}
            </div>
          </CollapseSection>

          <EventEditModal
            open={showEventEdit}
            event={currentEvent}
            onClose={() => setShowEventEdit(false)}
            onSave={handleSaveEvent}
          />
          <EventDescriptionModal
            open={showDescriptionEdit}
            initialDescription={currentEvent.description ?? ''}
            onClose={() => setShowDescriptionEdit(false)}
            onSave={handleSaveDescription}
          />
        </>
      )}

      {/* ── Группа ───────────────────────────────────────────────────────────── */}
      <CollapseSection title="Группа" defaultOpen={false}>
        <div className="p-4">
          <div className="text-lg font-black tracking-tight mb-3">{group?.name}</div>
          <div
            className="flex items-center gap-2.5 p-2.5 rounded-md mb-2.5"
            style={{
              background: 'rgba(251,191,36,.06)',
              border: '1px dashed rgba(251,191,36,.28)',
            }}
          >
            <span className="text-[11px] font-extrabold uppercase tracking-wide" style={{ color: 'var(--muted)' }}>
              Код
            </span>
            <span className="flex-1 text-xl font-black tracking-widest tabular-nums" style={{ color: 'var(--accent-2)' }}>
              {group?.invite_code ?? '—'}
            </span>
            <button
              type="button"
              onClick={copyCode}
              className="px-3 py-1.5 rounded-pill text-xs font-bold cursor-pointer"
              style={{
                background: 'rgba(255,255,255,.08)',
                border: '1px solid var(--gb)',
                color: 'var(--text)',
                fontFamily: 'inherit',
              }}
            >
              <IconClipboard size={13} /> {copied ? '✓' : ''}
            </button>
          </div>
          <button
            type="button"
            onClick={shareCode}
            className="w-full py-2.5 rounded-md border-none text-sm font-extrabold cursor-pointer flex items-center justify-center gap-2"
            style={{
              background: 'linear-gradient(90deg, var(--accent), var(--accent-2))',
              color: '#fff',
              fontFamily: 'inherit',
            }}
          >
            <IconShare size={15} strokeWidth={2} /> Пригласить друзей
          </button>
        </div>
      </CollapseSection>

      {/* ── Участники ────────────────────────────────────────────────────────── */}
      <CollapseSection title="Участники" count={members.length} defaultOpen>
        {members.map((m, i) => {
          const spent = eventItems
            .filter(it => it.enabled && it.bought && it.buyer_id === m.user_id && it.price > 0)
            .reduce((s, it) => s + it.price * it.qty, 0)
          const isMe = m.user_id === me?.id

          return (
            <div key={m.user_id}>
              {i > 0 && <Divider />}
              <div className="flex items-center gap-2.5 px-4 py-3">
                <div
                  className="flex items-center justify-center rounded-full text-sm font-extrabold shrink-0 size-9"
                  style={{
                    background: m.is_admin
                      ? 'linear-gradient(135deg,rgba(251,191,36,.35),rgba(249,115,22,.2))'
                      : 'linear-gradient(135deg,rgba(249,115,22,.2),rgba(251,191,36,.1))',
                    border: m.is_admin ? '1px solid rgba(251,191,36,.4)' : '1px solid var(--gbs)',
                    color: m.is_admin ? 'var(--accent-2)' : 'var(--accent)',
                  }}
                >
                  {m.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-sm font-bold truncate">{m.name}</span>
                    {m.is_admin && (
                      <span
                        className="inline-flex items-center gap-0.5 text-[10px] font-bold rounded-pill px-1.5 py-px"
                        style={{
                          background: 'rgba(251,191,36,.15)',
                          border: '1px solid rgba(251,191,36,.3)',
                          color: 'var(--accent-2)',
                        }}
                      >
                        <IconCrown size={9} strokeWidth={2} /> Админ
                      </span>
                    )}
                    {isMe && (
                      <span
                        className="text-[10px] font-bold rounded-pill px-1.5 py-px"
                        style={{
                          background: 'rgba(255,107,53,.15)',
                          border: '1px solid rgba(255,107,53,.3)',
                          color: 'var(--accent)',
                        }}
                      >
                        я
                      </span>
                    )}
                  </div>
                  {spent > 0 && (
                    <div className="text-[11px] mt-0.5" style={{ color: 'var(--muted)' }}>
                      потрачено {fmt(spent)}
                    </div>
                  )}
                </div>
                {amIAdmin && !isMe && (
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        if (m.is_admin) {
                          setConfirmDemote({ userId: m.user_id, name: m.name })
                          return
                        }
                        send({ type: 'member:promote', userId: m.user_id })
                        showToast(`${m.name} теперь администратор`)
                      }}
                      className="flex items-center justify-center size-7 rounded-md border cursor-pointer"
                      style={{
                        background: m.is_admin ? 'rgba(251,191,36,.12)' : 'rgba(255,255,255,.06)',
                        borderColor: m.is_admin ? 'rgba(251,191,36,.3)' : 'var(--gb)',
                        color: m.is_admin ? 'var(--accent-2)' : 'var(--muted)',
                        fontFamily: 'inherit',
                      }}
                    >
                      <IconCrown size={12} strokeWidth={2} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmKick({ userId: m.user_id, name: m.name })}
                      className="flex items-center justify-center size-7 border-none bg-transparent cursor-pointer"
                      style={{ color: 'var(--muted)', fontFamily: 'inherit' }}
                    >
                      <IconX size={14} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </CollapseSection>

      {/* ── Danger-зона ──────────────────────────────────────────────────────── */}
      <div className="mt-4 flex flex-col gap-2.5">
        <button
          type="button"
          onClick={() => setConfirmLeave(true)}
          className="w-full py-3 rounded-md border text-sm font-extrabold cursor-pointer flex items-center justify-center gap-2"
          style={{
            background: 'rgba(255,255,255,.05)',
            borderColor: 'rgba(255,255,255,.1)',
            color: 'var(--muted)',
            fontFamily: 'inherit',
          }}
        >
          <IconLogOut size={15} strokeWidth={2} /> Покинуть группу
        </button>
        {amIAdmin && (
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className="w-full py-3 rounded-md border text-sm font-extrabold cursor-pointer flex items-center justify-center gap-2"
            style={{
              background: 'rgba(248,113,113,.08)',
              borderColor: 'rgba(248,113,113,.25)',
              color: 'var(--red)',
              fontFamily: 'inherit',
            }}
          >
            <IconShield size={15} strokeWidth={2} /> Удалить группу
          </button>
        )}
      </div>

      {/* ── Модалки ──────────────────────────────────────────────────────────── */}
      <ConfirmModal
        open={confirmComplete}
        message={
          currentEvent
            ? `Завершить «${currentEvent.name}»? Список сохранится, событие перейдёт в завершённые.`
            : ''
        }
        confirmText="Завершить"
        danger={false}
        onConfirm={handleCompleteEvent}
        onCancel={() => setConfirmComplete(false)}
      />
      <ConfirmModal
        open={!!confirmKick}
        message={confirmKick ? `Исключить ${confirmKick.name} из группы?` : ''}
        confirmText="Исключить"
        onConfirm={() => {
          if (confirmKick) send({ type: 'member:remove', userId: confirmKick.userId })
          setConfirmKick(null)
        }}
        onCancel={() => setConfirmKick(null)}
      />
      <ConfirmModal
        open={!!confirmDemote}
        message={confirmDemote ? `Снять права администратора у ${confirmDemote.name}?` : ''}
        confirmText="Снять права"
        onConfirm={() => {
          if (confirmDemote) send({ type: 'member:demote', userId: confirmDemote.userId })
          setConfirmDemote(null)
        }}
        onCancel={() => setConfirmDemote(null)}
      />
      <ConfirmModal
        open={confirmLeave}
        message="Покинуть группу? Ты потеряешь доступ к списку."
        confirmText="Покинуть"
        onConfirm={() => { send({ type: 'member:leave' }); navigateToGroups() }}
        onCancel={() => setConfirmLeave(false)}
      />
      <ConfirmModal
        open={confirmDelete}
        message="Удалить группу? Все данные будут безвозвратно удалены для всех участников."
        confirmText="Удалить"
        onConfirm={() => { send({ type: 'group:delete' }); navigateToGroups() }}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  )
}
