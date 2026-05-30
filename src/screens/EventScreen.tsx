import { useState } from 'react'

import { GlassCard, Divider } from '../components/GlassCard'
import { ConfirmModal } from '../components/ConfirmModal'
import { EventDescriptionModal } from '../components/EventDescriptionModal'
import { EventEditModal } from '../components/EventEditModal'
import { NoEventsPrompt } from '../components/NoEventsPrompt'
import {
  IconCalendar,
  IconCheckCircle,
  IconClipboard,
  IconCrown,
  IconLogOut,
  IconMapPin,
  IconPencil,
  IconShare,
  IconShield,
  IconX,
} from '../components/Icon'
import { fmt, clearGroupSession } from '../lib/session'
import { formatEventDate } from '../lib/format'
import { canAdminCompleteEvent, isEventActive } from '../lib/event-status'
import { sendEventUpdates } from '../lib/event-update'
import { useWsStore } from '../stores/wsStore'
import { useSessionStore } from '../stores/sessionStore'
import { useAppStore } from '../stores/appStore'
import { useToastStore } from '../stores/toastStore'

import type { PicnicEvent } from '../types'

export function EventScreen() {
  const serverState = useWsStore(s => s.serverState)
  const send        = useWsStore(s => s.send)
  const resetWs     = useWsStore(s => s.reset)
  const me          = useSessionStore(s => s.me)
  const setGroupId  = useSessionStore(s => s.setGroupId)
  const setScreen   = useAppStore(s => s.setScreen)
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
  const eventIsActive = currentEvent ? isEventActive(currentEvent.status) : false

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

  const eventItems = currentEventId
    ? items.filter(i => i.event_id === currentEventId)
    : items

  if (!events.length) {
    return (
      <div className="px-3.5 pt-2 pb-8 relative">
        <NoEventsPrompt isAdmin={amIAdmin} onCreate={() => setShowEventSheet(true)} />
      </div>
    )
  }

  return (
    <div className="px-3.5 pt-2 pb-8 relative">

      {/* Hero события */}
      <div className="hero-card hero-card--event rounded-lg p-5 mb-3.5 relative overflow-hidden">
        <div className="pointer-events-none absolute -top-8 -right-8 size-36 rounded-full hero-glow" />
        <div className="relative">
          <div className="flex items-start justify-between gap-2 mb-2 pr-0">
            <div
              className={`inline-flex items-center gap-1 text-[10.5px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-pill ${
                eventIsActive ? 'badge-pill--active' : 'badge-pill--muted'
              }`}
            >
              {!eventIsActive && <IconCheckCircle size={11} strokeWidth={2.2} />}
              {eventIsActive ? 'Текущее событие' : 'Завершено'}
            </div>
            {amIAdmin && currentEvent && (
              <div className="flex items-center gap-1.5 shrink-0">
                {canCompleteEvent && (
                  <button
                    type="button"
                    onClick={() => setConfirmComplete(true)}
                    aria-label="Завершить событие"
                    title="Завершить событие"
                    className="size-8 rounded-sm flex items-center justify-center border cursor-pointer btn-icon-success"
                  >
                    <IconCheckCircle size={15} strokeWidth={2} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowEventEdit(true)}
                  aria-label="Редактировать событие"
                  title="Редактировать событие"
                  className="size-8 rounded-sm flex items-center justify-center border cursor-pointer btn-icon-surface"
                  style={{ fontFamily: 'inherit' }}
                >
                  <IconPencil size={13} />
                </button>
              </div>
            )}
          </div>
          <div className="text-xl font-black tracking-tight mb-1">
            {currentEvent?.name ?? 'Событие не выбрано'}
          </div>
          {currentEvent && (
            <div className="flex flex-col gap-1.5 mt-3">
              <div className="flex items-center gap-2 text-sm font-bold">
                <span
                  className="size-6 rounded-sm flex items-center justify-center shrink-0 icon-chip--fire"
                >
                  <IconCalendar size={12} strokeWidth={2} />
                </span>
                {formatEventDate(currentEvent.event_date)}
                {currentEvent.event_time && (
                  <span
                    className="text-[11.5px] font-extrabold px-1.5 py-px rounded-pill badge-pill--amber"
                  >
                    {currentEvent.event_time.slice(0, 5)}
                  </span>
                )}
              </div>
              {currentEvent.location && (
                <div className="flex items-center gap-2 text-sm font-bold">
                  <span
                    className="size-6 rounded-sm flex items-center justify-center shrink-0"
                    style={{ background: 'var(--surface-fire-14)', color: 'var(--accent)' }}
                  >
                    <IconMapPin size={12} strokeWidth={2} />
                  </span>
                  {currentEvent.location}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {currentEvent && (
        <div className="glass rounded-md p-4 mb-3.5">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <div
              className="text-[10.5px] font-extrabold uppercase tracking-wider"
              style={{ color: 'var(--muted)' }}
            >
              Заметки
            </div>
            {amIAdmin && (
              <button
                type="button"
                onClick={() => setShowDescriptionEdit(true)}
                className="inline-flex items-center gap-1 text-[11px] font-bold border-none bg-transparent cursor-pointer"
                style={{ color: 'var(--accent)', fontFamily: 'inherit' }}
              >
                <IconPencil size={12} />
                {currentEvent.description ? 'Изменить' : 'Добавить'}
              </button>
            )}
          </div>
          {currentEvent.description ? (
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{currentEvent.description}</p>
          ) : (
            <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>
              {amIAdmin ? 'Добавьте заметки — место, что взять с собой, договорённости…' : 'Заметок пока нет'}
            </p>
          )}
        </div>
      )}

      {currentEvent && (
        <EventEditModal
          open={showEventEdit}
          event={currentEvent}
          onClose={() => setShowEventEdit(false)}
          onSave={handleSaveEvent}
        />
      )}

      {currentEvent && (
        <EventDescriptionModal
          open={showDescriptionEdit}
          initialDescription={currentEvent.description ?? ''}
          onClose={() => setShowDescriptionEdit(false)}
          onSave={handleSaveDescription}
        />
      )}

      {/* Группа + код */}
      <div
        className="rounded-md p-4 mb-3.5"
        style={{
          background: 'var(--surface-subtle)',
          border: '1px solid var(--gb)',
          backdropFilter: 'blur(20px)',
        }}
      >
        <div
          className="text-[10.5px] font-extrabold uppercase tracking-wider mb-2"
          style={{ color: 'var(--muted)' }}
        >
          Группа
        </div>
        <div className="text-lg font-black tracking-tight mb-3">{group?.name}</div>

        <div
          className="flex items-center gap-2.5 p-2.5 rounded-md mb-2.5"
          style={{
            background: 'var(--surface-amber-6)',
            border: '1px dashed var(--surface-amber-28)',
          }}
        >
          <span
            className="text-[11px] font-extrabold uppercase tracking-wide"
            style={{ color: 'var(--muted)' }}
          >
            Код
          </span>
          <span
            className="flex-1 text-xl font-black tracking-widest tabular-nums"
            style={{ color: 'var(--accent-2)' }}
          >
            {group?.invite_code ?? '—'}
          </span>
          <button
            type="button"
            onClick={copyCode}
            className="px-3 py-1.5 rounded-pill text-xs font-bold border-none cursor-pointer"
            style={{
              background: 'var(--surface-white-8)',
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
            color: 'var(--text-on-accent)',
            fontFamily: 'inherit',
          }}
        >
          <IconShare size={15} strokeWidth={2} /> Пригласить друзей
        </button>
      </div>

      <div
        className="text-[11px] font-extrabold uppercase tracking-wider mb-2.5"
        style={{ color: 'var(--muted)' }}
      >
        Участники · {members.length}
      </div>

      <GlassCard>
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
                      ? 'linear-gradient(135deg,var(--surface-amber-35),rgba(249,115,22,.2))'
                      : 'linear-gradient(135deg,rgba(249,115,22,.2),var(--surface-amber-10))',
                    border: m.is_admin ? '1px solid var(--surface-amber-40)' : '1px solid var(--gbs)',
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
                          border: '1px solid var(--surface-amber-30)',
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
                          background: 'var(--surface-fire-15)',
                          border: '1px solid var(--surface-fire-30)',
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
                        background: m.is_admin ? 'var(--surface-amber-12)' : 'var(--surface-white-6)',
                        borderColor: m.is_admin ? 'var(--surface-amber-30)' : 'var(--gb)',
                        color: m.is_admin ? 'var(--accent-2)' : 'var(--muted)',
                      }}
                    >
                      <IconCrown size={12} strokeWidth={2} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmKick({ userId: m.user_id, name: m.name })}
                      className="flex items-center justify-center size-7 border-none bg-transparent cursor-pointer"
                      style={{ color: 'var(--muted)' }}
                    >
                      <IconX size={14} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </GlassCard>

      <div className="mt-4 flex flex-col gap-2.5">
        <button
          type="button"
          onClick={() => setConfirmLeave(true)}
          className="w-full py-3 rounded-md border text-sm font-extrabold cursor-pointer flex items-center justify-center gap-2"
          style={{
            background: 'var(--surface-subtle)',
            borderColor: 'var(--surface-white-10)',
            color: 'var(--muted)',
            fontFamily: 'inherit',
          }}
        >
          <IconLogOut size={15} strokeWidth={2} />
          Покинуть группу
        </button>
        {amIAdmin && (
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className="w-full py-3 rounded-md border text-sm font-extrabold cursor-pointer flex items-center justify-center gap-2"
            style={{
              background: 'var(--surface-danger-8)',
              borderColor: 'var(--surface-danger-25)',
              color: 'var(--red)',
              fontFamily: 'inherit',
            }}
          >
            <IconShield size={15} strokeWidth={2} />
            Удалить группу
          </button>
        )}
      </div>

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
