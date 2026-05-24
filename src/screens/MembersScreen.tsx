import { useState } from 'react'
import { GlassCard, Divider } from '../components/GlassCard'
import { IconClipboard, IconX, IconCrown, IconLogOut, IconShield } from '../components/Icon'
import { ConfirmModal } from '../components/ConfirmModal'
import { fmt } from '../lib/session'
import { clearGroupSession } from '../lib/session'
import { useWsStore } from '../stores/wsStore'
import { useSessionStore } from '../stores/sessionStore'
import { useAppStore } from '../stores/appStore'
import { useToastStore } from '../stores/toastStore'

export function MembersScreen() {
  const serverState = useWsStore(s => s.serverState)
  const send        = useWsStore(s => s.send)
  const resetWs     = useWsStore(s => s.reset)
  const me          = useSessionStore(s => s.me)
  const setGroupId  = useSessionStore(s => s.setGroupId)
  const setScreen   = useAppStore(s => s.setScreen)
  const exitEvent   = useAppStore(s => s.exitEvent)
  const setShowEventSheet = useAppStore(s => s.setShowEventSheet)
  const showToast   = useToastStore(s => s.show)

  const [copied, setCopied] = useState(false)
  const [confirmKick,   setConfirmKick]   = useState<{ userId: string; name: string } | null>(null)
  const [confirmDemote, setConfirmDemote] = useState<{ userId: string; name: string } | null>(null)
  const [confirmLeave,  setConfirmLeave]  = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const { members = [], items = [], group } = serverState ?? {}

  const amIAdmin = members.find(m => m.user_id === me?.id)?.is_admin ?? false

  // ── helpers ───────────────────────────────────────────────────────────────

  function copyCode() {
    const code = group?.invite_code
    if (!code) return
    navigator.clipboard?.writeText(code).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
    showToast('Код скопирован: ' + code)
  }

  function navigateToGroups() {
    clearGroupSession()
    setGroupId(null)
    resetWs()
    exitEvent()
    setShowEventSheet(false)
    setScreen('groups')
  }

  function handleLeave() {
    send({ type: 'member:leave' })
    navigateToGroups()
  }

  function handleDelete() {
    send({ type: 'group:delete' })
    navigateToGroups()
  }

  function handleKick(userId: string) {
    send({ type: 'member:remove', userId })
    setConfirmKick(null)
  }

  function handlePromote(userId: string, name: string) {
    send({ type: 'member:promote', userId })
    showToast(`${name} теперь администратор`)
  }

  function handleDemote(userId: string) {
    send({ type: 'member:demote', userId })
    setConfirmDemote(null)
  }

  // ── render ────────────────────────────────────────────────────────────────

  return (
    <div className="px-[14px] pt-2 pb-8 relative">

      {/* Invite */}
      <div className="glass rounded-[20px] p-[16px] mb-3 text-center">
        <div className="text-[11px] font-extrabold uppercase tracking-[.06em] mb-[10px]" style={{ color: 'var(--muted)' }}>
          Пригласить в группу
        </div>
        <div className="text-[32px] font-black tracking-[.15em] my-[10px]" style={{ color: 'var(--accent2)' }}>
          {group?.invite_code || '——'}
        </div>
        <div className="text-[12px] mb-[10px]" style={{ color: 'var(--muted)' }}>
          Поделись кодом — друзья введут его при входе
        </div>
        <button onClick={copyCode}
          className="inline-flex items-center gap-[6px] rounded-full text-[12px] font-bold cursor-pointer border-none px-4 py-2"
          style={{ background: 'rgba(255,255,255,.08)', border: '1px solid var(--gb)', color: 'var(--text)', fontFamily: 'inherit' }}>
          <IconClipboard size={13} /> {copied ? 'Скопировано!' : 'Скопировать код'}
        </button>
      </div>

      {/* Members list */}
      <div className="text-[11px] font-extrabold uppercase tracking-[.08em] mb-[10px]" style={{ color: 'var(--muted)' }}>
        Участники · {members.length}
      </div>

      <GlassCard>
        {members.map((m, i) => {
          const spent = items
            .filter(it => it.enabled && it.bought && it.buyer_id === m.user_id && it.price > 0)
            .reduce((s, it) => s + it.price * it.qty, 0)
          const isMe = m.user_id === me?.id

          return (
            <div key={m.user_id}>
              {i > 0 && <Divider />}
              <div className="flex items-center gap-[10px] px-[15px] py-[12px]">

                {/* Avatar */}
                <div className="flex items-center justify-center rounded-full text-[14px] font-extrabold flex-shrink-0"
                  style={{
                    width: 36, height: 36,
                    background: m.is_admin
                      ? 'linear-gradient(135deg,rgba(251,191,36,.35),rgba(249,115,22,.2))'
                      : 'linear-gradient(135deg,rgba(249,115,22,.2),rgba(251,191,36,.1))',
                    border: m.is_admin ? '1px solid rgba(251,191,36,.4)' : '1px solid var(--gbs)',
                    color: m.is_admin ? 'var(--accent2)' : 'var(--accent)',
                  }}>
                  {m.name.charAt(0).toUpperCase()}
                </div>

                {/* Name + badges */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-[6px] flex-wrap">
                    <span className="text-[13px] font-bold truncate">{m.name}</span>
                    {m.is_admin && (
                      <span className="inline-flex items-center gap-[3px] text-[10px] font-bold rounded-full px-[6px] py-[2px]"
                        style={{ background: 'rgba(251,191,36,.15)', border: '1px solid rgba(251,191,36,.3)', color: 'var(--accent2)' }}>
                        <IconCrown size={9} strokeWidth={2} /> Админ
                      </span>
                    )}
                    {isMe && (
                      <span className="text-[10px] font-bold rounded-full px-[6px] py-[2px]"
                        style={{ background: 'rgba(255,107,53,.15)', border: '1px solid rgba(255,107,53,.3)', color: 'var(--accent)' }}>
                        я
                      </span>
                    )}
                  </div>
                  {spent > 0 && (
                    <div className="text-[11px] mt-[2px]" style={{ color: 'var(--muted)' }}>
                      потрачено {fmt(spent)}
                    </div>
                  )}
                </div>

                {/* Admin actions (only for non-self, only for admins) */}
                {amIAdmin && !isMe && (
                  <div className="flex items-center gap-[4px] flex-shrink-0">
                    {/* Crown toggle */}
                    <button
                      onClick={() => m.is_admin
                        ? setConfirmDemote({ userId: m.user_id, name: m.name })
                        : handlePromote(m.user_id, m.name)
                      }
                      title={m.is_admin ? 'Снять права' : 'Сделать администратором'}
                      className="flex items-center justify-center cursor-pointer border-none rounded-[7px] transition-all duration-150"
                      style={{
                        width: 28, height: 28,
                        background: m.is_admin ? 'rgba(251,191,36,.12)' : 'rgba(255,255,255,.06)',
                        border: `1px solid ${m.is_admin ? 'rgba(251,191,36,.3)' : 'var(--gb)'}`,
                        color: m.is_admin ? 'var(--accent2)' : 'var(--muted)',
                      }}>
                      <IconCrown size={12} strokeWidth={2} />
                    </button>
                    {/* Kick */}
                    <button
                      onClick={() => setConfirmKick({ userId: m.user_id, name: m.name })}
                      className="flex items-center justify-center cursor-pointer border-none rounded-[7px] transition-all duration-150"
                      style={{ width: 28, height: 28, background: 'transparent', color: 'var(--muted)' }}>
                      <IconX size={14} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </GlassCard>

      {/* ── Actions ────────────────────────────────────────────────────────── */}
      <div className="mt-4 flex flex-col gap-[10px]">

        {/* Leave */}
        <button onClick={() => setConfirmLeave(true)}
          className="w-full py-[13px] rounded-[14px] border-none text-[14px] font-extrabold cursor-pointer flex items-center justify-center gap-[8px]"
          style={{
            background: 'rgba(255,255,255,.05)',
            border: '1px solid rgba(255,255,255,.1)',
            color: 'var(--muted)',
            fontFamily: 'inherit',
          }}>
          <IconLogOut size={15} strokeWidth={2} />
          Покинуть группу
        </button>

        {/* Delete (admin only) */}
        {amIAdmin && (
          <button onClick={() => setConfirmDelete(true)}
            className="w-full py-[13px] rounded-[14px] border-none text-[14px] font-extrabold cursor-pointer flex items-center justify-center gap-[8px]"
            style={{
              background: 'rgba(248,113,113,.08)',
              border: '1px solid rgba(248,113,113,.25)',
              color: 'var(--red)',
              fontFamily: 'inherit',
            }}>
            <IconShield size={15} strokeWidth={2} />
            Удалить группу
          </button>
        )}
      </div>

      {/* ── Confirm modals ─────────────────────────────────────────────────── */}

      <ConfirmModal
        open={!!confirmKick}
        message={confirmKick ? `Исключить ${confirmKick.name} из группы?` : ''}
        confirmText="Исключить"
        onConfirm={() => confirmKick && handleKick(confirmKick.userId)}
        onCancel={() => setConfirmKick(null)}
      />

      <ConfirmModal
        open={!!confirmDemote}
        message={confirmDemote ? `Снять права администратора у ${confirmDemote.name}?` : ''}
        confirmText="Снять права"
        onConfirm={() => confirmDemote && handleDemote(confirmDemote.userId)}
        onCancel={() => setConfirmDemote(null)}
      />

      <ConfirmModal
        open={confirmLeave}
        message="Покинуть группу? Ты потеряешь доступ к списку."
        confirmText="Покинуть"
        onConfirm={handleLeave}
        onCancel={() => setConfirmLeave(false)}
      />

      <ConfirmModal
        open={confirmDelete}
        message="Удалить группу? Все данные будут безвозвратно удалены для всех участников."
        confirmText="Удалить"
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  )
}
