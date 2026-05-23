import { useState, type CSSProperties } from 'react'
import { createGroup, joinGroup } from '../lib/api'
import { uid } from '../lib/session'
import { useSessionStore } from '../stores/sessionStore'
import type { User } from '../types'

interface OnboardingScreenProps {
  onDone: (user: User, gId: string) => void
}

export function OnboardingScreen({ onDone }: OnboardingScreenProps) {
  const me = useSessionStore(s => s.me)

  const [tab,       setTab]       = useState<'create' | 'join'>('create')
  const [err,       setErr]       = useState('')
  const [name,      setName]      = useState('')
  const [groupName, setGroupName] = useState('')
  const [code,      setCode]      = useState('')

  const hasTg = !!me?.id

  async function doCreate() {
    if (!groupName.trim()) { setErr('Введите название группы'); return }
    const user = hasTg ? me! : (name.trim() ? { id: uid(), name: name.trim() } : null)
    if (!user) { setErr('Введите своё имя'); return }
    setErr('')
    try {
      const d = await createGroup({ name: groupName.trim(), userId: user.id, userName: user.name })
      if (d.error) { setErr(d.error); return }
      onDone(user, d.id!)
    } catch { setErr('Нет соединения с сервером') }
  }

  async function doJoin() {
    if (!code.trim()) { setErr('Введите код'); return }
    const user = hasTg ? me! : (name.trim() ? { id: uid(), name: name.trim() } : null)
    if (!user) { setErr('Введите своё имя'); return }
    setErr('')
    try {
      const d = await joinGroup({ inviteCode: code.trim(), userId: user.id, userName: user.name })
      if (d.error) { setErr(d.error); return }
      onDone(user, d.id!)
    } catch { setErr('Нет соединения с сервером') }
  }

  const inputStyle: CSSProperties = {
    width: '100%', padding: '12px 14px',
    border: '1px solid var(--gb)', borderRadius: 12,
    background: 'rgba(255,255,255,.08)', color: 'var(--text)',
    fontFamily: 'inherit', fontSize: 14, fontWeight: 600, outline: 'none',
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 relative z-10">
      <div className="text-[28px] font-black mb-2" style={{ color: 'var(--accent)' }}>🔥 Пикник</div>
      <div className="text-[13px] mb-8 text-center" style={{ color: 'var(--muted)' }}>
        Планируй пикник вместе с друзьями
      </div>

      <div className="glass rounded-[20px] p-5 w-full max-w-[360px]">
        {/* Tabs */}
        <div className="flex gap-[6px] mb-5">
          {(['create', 'join'] as const).map(t => (
            <button key={t} onClick={() => { setTab(t); setErr('') }}
              className="flex-1 py-[9px] rounded-[10px] text-[13px] font-bold cursor-pointer border-none transition-all"
              style={{
                background: tab === t ? 'var(--accent)' : 'rgba(255,255,255,.06)',
                border:     tab === t ? '1px solid var(--accent)' : '1px solid var(--gb)',
                color:      tab === t ? '#fff' : 'var(--muted)',
                fontFamily: 'inherit',
              }}>
              {t === 'create' ? 'Создать группу' : 'Войти по коду'}
            </button>
          ))}
        </div>

        {hasTg && (
          <div className="rounded-xl px-3 py-[10px] mb-3 text-[12px]"
            style={{ background: 'rgba(255,255,255,.06)', border: '1px solid var(--gb)', color: 'var(--muted)' }}>
            👤 Войдёшь как <b style={{ color: 'var(--text)' }}>{me!.name}</b>
          </div>
        )}

        {!hasTg && (
          <div className="mb-3">
            <label className="block text-[11px] font-extrabold mb-[6px] uppercase tracking-wider" style={{ color: 'var(--muted)' }}>Ваше имя</label>
            <input style={inputStyle} value={name} onChange={e => setName(e.target.value)} placeholder="Как вас зовут?" />
          </div>
        )}

        {tab === 'create' ? (
          <>
            <div className="mb-3">
              <label className="block text-[11px] font-extrabold mb-[6px] uppercase tracking-wider" style={{ color: 'var(--muted)' }}>Название группы</label>
              <input style={inputStyle} value={groupName} onChange={e => setGroupName(e.target.value)} placeholder="Пикник на даче" />
            </div>
            <button onClick={doCreate}
              className="w-full py-[14px] rounded-[12px] border-none text-[15px] font-extrabold cursor-pointer mt-1"
              style={{ background: 'var(--accent)', color: '#fff', fontFamily: 'inherit' }}>
              Создать пикник 🔥
            </button>
          </>
        ) : (
          <>
            <div className="mb-3">
              <label className="block text-[11px] font-extrabold mb-[6px] uppercase tracking-wider" style={{ color: 'var(--muted)' }}>Код приглашения</label>
              <input
                style={{ ...inputStyle, textTransform: 'uppercase', letterSpacing: '.1em', fontSize: 18, textAlign: 'center' }}
                value={code} onChange={e => setCode(e.target.value)} placeholder="XXXXXX" maxLength={6} />
            </div>
            <button onClick={doJoin}
              className="w-full py-[14px] rounded-[12px] border-none text-[15px] font-extrabold cursor-pointer mt-1"
              style={{ background: 'var(--accent)', color: '#fff', fontFamily: 'inherit' }}>
              Присоединиться
            </button>
          </>
        )}

        {err && <div className="text-center text-[12px] mt-3" style={{ color: 'var(--red)' }}>{err}</div>}
      </div>
    </div>
  )
}
