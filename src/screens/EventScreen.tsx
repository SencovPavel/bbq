import { useState } from 'react'

import { GlassCard, Divider } from '../components/GlassCard'
import { ConfirmModal } from '../components/ConfirmModal'
import { OfflineBanner } from '../components/states/OfflineBanner'
import {
  IconCalendar,
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
import { useWsStore } from '../stores/wsStore'
import { useSessionStore } from '../stores/sessionStore'
import { useAppStore } from '../stores/appStore'
import { useToastStore } from '../stores/toastStore'

export function EventScreen() {
  const serverState = useWsStore(s => s.serverState)
  const wsOk        = useWsStore(s => s.wsOk)
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

  const { members = [], items = [], group, events = [] } = serverState ?? {}
  const currentEvent = currentEventId ? events.find(e => e.id === currentEventId) : undefined
  const amIAdmin = members.find(m => m.user_id === me?.id)?.is_admin ?? false

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

  return (
    <div className="px-3.5 pt-2 pb-8 relative">
      {!wsOk && <OfflineBanner />}

      {/* Hero события */}
      <div
        className="rounded-lg p-5 mb-3.5 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(249,115,22,.18), rgba(251,191,36,.06))',
          border: '1px solid rgba(249,115,22,.25)',
          backdropFilter: 'blur(24px)',
        }}
      >
        <div
          className="pointer-events-none absolute -top-8 -right-8 size-36 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(251,191,36,.18), transparent 65%)' }}
        />
        <div className="relative">
          <div
            className="inline-flex items-center gap-1 text-[10.5px] font-extrabold uppercase tracking-wider mb-2 px-2 py-0.5 rounded-pill"
            style={{
              color: 'var(--accent-2)',
              background: 'rgba(251,191,36,.1)',
              border: '1px solid rgba(251,191,36,.22)',
            }}
          >
            Текущее событие
          </div>
          <div className="text-xl font-black tracking-tight mb-1">
            {currentEvent?.name ?? 'Событие не выбрано'}
          </div>
          {currentEvent && (
            <div className="flex flex-col gap-1.5 mt-3">
              <div className="flex items-center gap-2 text-sm font-bold">
                <span
                  className="size-6 rounded-sm flex items-center justify-center shrink-0"
                  style={{ background: 'rgba(249,115,22,.14)', color: 'var(--accent)' }}
                >
                  <IconCalendar size={12} strokeWidth={2} />
                </span>
                {formatEventDate(currentEvent.event_date)}
                {currentEvent.event_time && (
                  <span
                    className="text-[11.5px] font-extrabold px-1.5 py-px rounded-pill"
                    style={{
                      color: 'var(--accent-2)',
                      background: 'rgba(251,191,36,.1)',
                      border: '1px solid rgba(251,191,36,.2)',
                    }}
                  >
                    {currentEvent.event_time.slice(0, 5)}
                  </span>
                )}
              </div>
              {currentEvent.location && (
                <div className="flex items-center gap-2 text-sm font-bold">
                  <span
                    className="size-6 rounded-sm flex items-center justify-center shrink-0"
                    style={{ background: 'rgba(249,115,22,.14)', color: 'var(--accent)' }}
                  >
                    <IconMapPin size={12} strokeWidth={2} />
                  </span>
                  {currentEvent.location}
                </div>
              )}
            </div>
          )}
          <button
            type="button"
            onClick={() => setShowEventSheet(true)}
            className="absolute top-0 right-0 size-8 rounded-sm flex items-center justify-center border cursor-pointer"
            style={{
              background: 'rgba(255,255,255,.06)',
              borderColor: 'var(--gb)',
              color: 'var(--muted)',
            }}
            title="Сменить событие"
          >
            <IconPencil size={13} />
          </button>
        </div>
      </div>

      {currentEvent?.description && (
        <div className="glass rounded-md p-4 mb-3.5">
          <div
            className="text-[10.5px] font-extrabold uppercase tracking-wider mb-1.5"
            style={{ color: 'var(--muted)' }}
          >
            Заметки
          </div>
          <p className="text-sm leading-relaxed">{currentEvent.description}</p>
        </div>
      )}

      {/* Группа + код */}
      <div
        className="rounded-md p-4 mb-3.5"
        style={{
          background: 'rgba(255,240,200,0.04)',
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
            background: 'rgba(251,191,36,.06)',
            border: '1px dashed rgba(251,191,36,.28)',
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
            background: 'rgba(255,255,255,.05)',
            borderColor: 'rgba(255,255,255,.1)',
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
              background: 'rgba(248,113,113,.08)',
              borderColor: 'rgba(248,113,113,.25)',
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
