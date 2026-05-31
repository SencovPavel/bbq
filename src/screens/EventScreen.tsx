import { type ReactNode } from 'react'

import { Divider } from '@shared/ui/GlassCard'
import { CollapseSection } from '@shared/ui/CollapseSection'
import { ConfirmModal } from '@shared/ui/ConfirmModal'
import { EventDescriptionModal } from '@widgets/EventDescriptionModal'
import { EventEditModal } from '@widgets/EventEditModal'
import { NoEventsPrompt } from '@widgets/NoEventsPrompt'
import {
  IconCalendar, IconChevronRight, IconClock, IconClipboard, IconCrown,
  IconFlag, IconLogOut, IconMapPin, IconPencil, IconShare, IconShield, IconX,
} from '@shared/ui/Icon'
import { useEventScreenVM } from './useEventScreenVM'

// ── MetaChip ─────────────────────────────────────────────────────────────────

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
  const vm = useEventScreenVM()
  const {
    events, members, eventItems, evItems, evBought,
    currentEvent, amIAdmin, canCompleteEvent,
    countdownLabel, urgency, readyPct, readyColor, C,
    group, copied, me,
    confirmKick, confirmDemote, confirmLeave, confirmDelete,
    confirmComplete, showDescriptionEdit, showEventEdit,
    setConfirmKick, setConfirmDemote, setConfirmLeave, setConfirmDelete,
    setConfirmComplete, setShowDescriptionEdit, setShowEventEdit,
    handleCompleteEvent, handleSaveDescription, handleSaveEvent,
    copyCode, shareCode, navigateToGroups, promoteMember,
    setShowEventSheet, setTab, send,
    fmt, shortDate,
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

      {/* ── Hero ──────────────────────────────────────────────────────────────── */}
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
          {/* Countdown + admin buttons */}
          <div className="flex items-center justify-between gap-2 mb-3">
            {countdownLabel ? (
              <div
                className="inline-flex items-center gap-1.5 h-8 px-3 rounded-pill"
                style={{ background: 'rgba(16,14,11,.35)', border: `1px solid ${urgency.border}` }}
              >
                <span className="size-1.5 rounded-full shrink-0" style={{ background: urgency.dot, boxShadow: urgency.glow }} />
                <span className="text-xs font-black tracking-tight" style={{ color: urgency.text }}>{countdownLabel}</span>
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
                    style={{ background: 'rgba(34,197,94,.12)', borderColor: 'rgba(34,197,94,.35)', color: '#4ade80', fontFamily: 'inherit' }}
                  >
                    <IconFlag size={15} strokeWidth={2} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowEventEdit(true)}
                  title="Редактировать событие"
                  className="size-8 rounded-[9px] flex items-center justify-center border cursor-pointer"
                  style={{ background: 'rgba(251,191,36,.12)', borderColor: 'rgba(251,191,36,.3)', color: 'var(--accent-2)', fontFamily: 'inherit' }}
                >
                  <IconPencil size={13} />
                </button>
              </div>
            )}
          </div>

          {/* Event name */}
          <div className="text-xl font-black tracking-tight mb-3">
            {currentEvent?.name ?? 'Событие не выбрано'}
          </div>

          {/* Meta chips */}
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

          {/* Readiness ring */}
          {currentEvent && (
            <div className="flex items-center gap-3 pt-3.5" style={{ borderTop: '1px solid rgba(255,255,255,.12)' }}>
              <svg width="40" height="40" viewBox="0 0 36 36" className="shrink-0" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(255,255,255,.12)" strokeWidth="4" />
                <circle
                  cx="18" cy="18" r="15" fill="none"
                  stroke={readyColor} strokeWidth="4" strokeLinecap="round"
                  strokeDasharray={`${readyPct / 100 * C} ${C}`}
                />
              </svg>
              <div className="flex-1 min-w-0">
                <div className="text-[15px] font-black tabular-nums" style={{ color: readyColor }}>Готово {readyPct}%</div>
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
                style={{ background: 'rgba(16,14,11,.35)', border: '1px solid rgba(255,255,255,.12)', color: 'var(--text)', fontFamily: 'inherit' }}
              >
                К списку <IconChevronRight size={12} strokeWidth={2.5} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Заметки ───────────────────────────────────────────────────────────── */}
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

      {/* ── Группа ────────────────────────────────────────────────────────────── */}
      <CollapseSection title="Группа" defaultOpen={false}>
        <div className="p-4">
          <div className="text-lg font-black tracking-tight mb-3">{group?.name}</div>
          <div
            className="flex items-center gap-2.5 p-2.5 rounded-md mb-2.5"
            style={{ background: 'rgba(251,191,36,.06)', border: '1px dashed rgba(251,191,36,.28)' }}
          >
            <span className="text-[11px] font-extrabold uppercase tracking-wide" style={{ color: 'var(--muted)' }}>Код</span>
            <span className="flex-1 text-xl font-black tracking-widest tabular-nums" style={{ color: 'var(--accent-2)' }}>
              {group?.invite_code ?? '—'}
            </span>
            <button
              type="button"
              onClick={copyCode}
              className="px-3 py-1.5 rounded-pill text-xs font-bold cursor-pointer"
              style={{ background: 'rgba(255,255,255,.08)', border: '1px solid var(--gb)', color: 'var(--text)', fontFamily: 'inherit' }}
            >
              <IconClipboard size={13} /> {copied ? '✓' : ''}
            </button>
          </div>
          <button
            type="button"
            onClick={shareCode}
            className="w-full py-2.5 rounded-md border-none text-sm font-extrabold cursor-pointer flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(90deg, var(--accent), var(--accent-2))', color: '#fff', fontFamily: 'inherit' }}
          >
            <IconShare size={15} strokeWidth={2} /> Пригласить друзей
          </button>
        </div>
      </CollapseSection>

      {/* ── Участники ─────────────────────────────────────────────────────────── */}
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
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-bold rounded-pill px-1.5 py-px"
                        style={{ background: 'rgba(251,191,36,.15)', border: '1px solid rgba(251,191,36,.3)', color: 'var(--accent-2)' }}>
                        <IconCrown size={9} strokeWidth={2} /> Админ
                      </span>
                    )}
                    {isMe && (
                      <span className="text-[10px] font-bold rounded-pill px-1.5 py-px"
                        style={{ background: 'rgba(255,107,53,.15)', border: '1px solid rgba(255,107,53,.3)', color: 'var(--accent)' }}>
                        я
                      </span>
                    )}
                  </div>
                  {spent > 0 && (
                    <div className="text-[11px] mt-0.5" style={{ color: 'var(--muted)' }}>потрачено {fmt(spent)}</div>
                  )}
                </div>
                {amIAdmin && !isMe && (
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => promoteMember(m.user_id, m.name, m.is_admin)}
                      className="flex items-center justify-center size-7 rounded-md border cursor-pointer"
                      style={{
                        background: m.is_admin ? 'rgba(251,191,36,.12)' : 'rgba(255,255,255,.06)',
                        borderColor: m.is_admin ? 'rgba(251,191,36,.3)' : 'var(--gb)',
                        color: m.is_admin ? 'var(--accent-2)' : 'var(--muted)', fontFamily: 'inherit',
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

      {/* ── Danger zone ───────────────────────────────────────────────────────── */}
      <div className="mt-4 flex flex-col gap-2.5">
        <button
          type="button"
          onClick={() => setConfirmLeave(true)}
          className="w-full py-3 rounded-md border text-sm font-extrabold cursor-pointer flex items-center justify-center gap-2"
          style={{ background: 'rgba(255,255,255,.05)', borderColor: 'rgba(255,255,255,.1)', color: 'var(--muted)', fontFamily: 'inherit' }}
        >
          <IconLogOut size={15} strokeWidth={2} /> Покинуть группу
        </button>
        {amIAdmin && (
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className="w-full py-3 rounded-md border text-sm font-extrabold cursor-pointer flex items-center justify-center gap-2"
            style={{ background: 'rgba(248,113,113,.08)', borderColor: 'rgba(248,113,113,.25)', color: 'var(--red)', fontFamily: 'inherit' }}
          >
            <IconShield size={15} strokeWidth={2} /> Удалить группу
          </button>
        )}
      </div>

      {/* ── Confirm modals ─────────────────────────────────────────────────────── */}
      <ConfirmModal
        open={confirmComplete}
        message={currentEvent ? `Завершить «${currentEvent.name}»? Список сохранится, событие перейдёт в завершённые.` : ''}
        confirmText="Завершить"
        danger={false}
        onConfirm={handleCompleteEvent}
        onCancel={() => setConfirmComplete(false)}
      />
      <ConfirmModal
        open={!!confirmKick}
        message={confirmKick ? `Исключить ${confirmKick.name} из группы?` : ''}
        confirmText="Исключить"
        onConfirm={() => { if (confirmKick) send({ type: 'member:remove', userId: confirmKick.userId }); setConfirmKick(null) }}
        onCancel={() => setConfirmKick(null)}
      />
      <ConfirmModal
        open={!!confirmDemote}
        message={confirmDemote ? `Снять права администратора у ${confirmDemote.name}?` : ''}
        confirmText="Снять права"
        onConfirm={() => { if (confirmDemote) send({ type: 'member:demote', userId: confirmDemote.userId }); setConfirmDemote(null) }}
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
