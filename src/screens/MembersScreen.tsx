import { useState } from 'react'
import { GlassCard, Divider } from '../components/GlassCard'
import { ConfirmModal } from '../components/ConfirmModal'
import { fmt } from '../lib/session'
import { useWsStore } from '../stores/wsStore'
import { useSessionStore } from '../stores/sessionStore'
import { useToastStore } from '../stores/toastStore'

export function MembersScreen() {
  const serverState = useWsStore(s => s.serverState)
  const send        = useWsStore(s => s.send)
  const me          = useSessionStore(s => s.me)
  const showToast   = useToastStore(s => s.show)

  const [copied, setCopied] = useState(false)
  const [confirmRemove, setConfirmRemove] = useState<{ userId: string; name: string } | null>(null)
  const { members = [], items = [], group } = serverState ?? {}

  function copyCode() {
    const code = group?.invite_code
    if (!code) return
    navigator.clipboard?.writeText(code).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
    showToast('Код скопирован: ' + code)
  }

  function removeMember(userId: string, name: string) {
    setConfirmRemove({ userId, name })
  }

  return (
    <div className="px-[14px] pt-2 pb-8 relative z-10">
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
          📋 {copied ? 'Скопировано!' : 'Скопировать код'}
        </button>
      </div>

      <div className="text-[11px] font-extrabold uppercase tracking-[.08em] mb-[10px]" style={{ color: 'var(--muted)' }}>
        Участники · {members.length}
      </div>

      <ConfirmModal
        open={!!confirmRemove}
        message={confirmRemove ? `Удалить ${confirmRemove.name} из группы?` : ''}
        confirmText="Удалить"
        onConfirm={() => { if (confirmRemove) send({ type: 'member:remove', userId: confirmRemove.userId }); setConfirmRemove(null) }}
        onCancel={() => setConfirmRemove(null)}
      />

      <GlassCard>
        {members.map((m, i) => {
          const mySum = items
            .filter(it => it.enabled && it.bought && it.buyer_id === m.user_id && it.price > 0)
            .reduce((s, it) => s + it.price * it.qty, 0)
          const isMe = m.user_id === me?.id
          return (
            <div key={m.user_id}>
              {i > 0 && <Divider />}
              <div className="flex items-center gap-[10px] px-[15px] py-[12px]">
                <div className="flex items-center justify-center rounded-full text-[14px] font-extrabold flex-shrink-0"
                  style={{ width: 36, height: 36,
                    background: 'linear-gradient(135deg,rgba(249,115,22,.3),rgba(251,191,36,.2))',
                    border: '1px solid var(--gbs)', color: 'var(--accent)' }}>
                  {m.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 text-[13px] font-bold flex items-center gap-2">
                  {m.name}
                  {isMe && (
                    <span className="text-[10px] font-bold rounded-full px-[7px] py-[2px]"
                      style={{ background: 'rgba(255,107,53,.15)', border: '1px solid rgba(255,107,53,.3)', color: 'var(--accent)' }}>
                      я
                    </span>
                  )}
                </div>
                {mySum > 0 && (
                  <div className="text-[12px] font-bold" style={{ color: 'var(--muted)' }}>{fmt(mySum)}</div>
                )}
                {!isMe && (
                  <button onClick={() => removeMember(m.user_id, m.name)}
                    className="text-[13px] cursor-pointer border-none bg-transparent px-1"
                    style={{ color: 'var(--muted)' }}>✕</button>
                )}
              </div>
            </div>
          )
        })}
      </GlassCard>
    </div>
  )
}
