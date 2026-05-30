import { useState, type CSSProperties } from 'react'
import { createGroup, joinGroup } from '../lib/api'
import { IconFlame, IconPerson } from '../components/Icon'
import { getTelegramInitData } from '../lib/tg'
import { useSessionStore } from '../stores/sessionStore'
import type { User } from '../types'

interface OnboardingScreenProps {
  onDone: (user: User, gId: string) => void
}

export function OnboardingScreen({ onDone }: OnboardingScreenProps) {
  const me = useSessionStore(s => s.me)

  const [tab,       setTab]       = useState<'create' | 'join'>('create')
  const [err,       setErr]       = useState('')
  const [groupName, setGroupName] = useState('')
  const [code,      setCode]      = useState('')

  const hasTg = !!me?.id
  const canAuth = hasTg || !!getTelegramInitData()

  async function doCreate() {
    if (!canAuth) {
      setErr('Войдите на сайте или откройте приложение в Telegram')
      return
    }
    if (!groupName.trim()) { setErr('Введите название группы'); return }
    if (!hasTg) { setErr('Войдите на сайте или откройте приложение в Telegram'); return }
    setErr('')
    try {
      const d = await createGroup({ name: groupName.trim() })
      if (d.error) { setErr(d.error); return }
      onDone(me!, d.id!)
    } catch { setErr('Нет соединения с сервером') }
  }

  async function doJoin() {
    if (!canAuth) {
      setErr('Войдите на сайте или откройте приложение в Telegram')
      return
    }
    if (!code.trim()) { setErr('Введите код'); return }
    if (!hasTg) { setErr('Войдите на сайте или откройте приложение в Telegram'); return }
    setErr('')
    try {
      const d = await joinGroup({ inviteCode: code.trim() })
      if (d.error) { setErr(d.error); return }
      onDone(me!, d.id!)
    } catch { setErr('Нет соединения с сервером') }
  }

  const inputStyle: CSSProperties = {
    width: '100%', padding: '12px 14px',
    border: '1px solid var(--gb)', borderRadius: 12,
    background: 'rgba(255,240,200,.06)', color: 'var(--text)',
    fontFamily: 'inherit', fontSize: 14, fontWeight: 600, outline: 'none',
  }

  return (
    <div className="w-full">
      <div className="flex items-center gap-[8px] text-[28px] font-black mb-2 lg:hidden" style={{ color: 'var(--accent)' }}>
        <IconFlame size={28} strokeWidth={1.4} /> Котёл
      </div>
      <div className="text-[13px] mb-6 lg:mb-8 text-center lg:text-left" style={{ color: 'var(--muted)' }}>
        Создайте группу или войдите по коду
      </div>

      <div className="lg:p-0 lg:bg-transparent lg:border-none rounded-[20px] p-5 w-full glass lg:shadow-none">
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
              {t === 'create' ? '＋ Создать группу' : 'Войти по коду'}
            </button>
          ))}
        </div>

        {hasTg && (
          <div className="rounded-xl px-3 py-[10px] mb-3 text-[12px]"
            style={{ background: 'rgba(255,255,255,.06)', border: '1px solid var(--gb)', color: 'var(--muted)' }}>
            <span className="inline-flex items-center gap-[5px]">
              <IconPerson size={12} strokeWidth={2} /> Войдёшь как <b style={{ color: 'var(--text)' }}>{me!.name}</b>
            </span>
          </div>
        )}

        {!canAuth && (
          <div className="mb-3 rounded-xl px-3 py-[10px] text-[12px]"
            style={{ background: 'rgba(255,80,80,.08)', border: '1px solid var(--gb)', color: 'var(--muted)' }}>
            Для создания или входа в группу нужен аккаунт на сайте или Telegram Mini App.
          </div>
        )}

        {/* Оба таба в одной grid-ячейке — высота карточки всегда = max(обоих) */}
        <div style={{ display: 'grid' }}>
          {/* Создать */}
          <div style={{ gridArea: '1/1', visibility: tab === 'create' ? 'visible' : 'hidden' }}>
            <div className="mb-3">
              <label className="block text-[11px] font-extrabold mb-[6px] uppercase tracking-wider" style={{ color: 'var(--muted)' }}>Название группы</label>
              <input style={inputStyle} value={groupName} onChange={e => setGroupName(e.target.value)} placeholder="Пикник на даче" />
            </div>
            <button onClick={doCreate}
              className="w-full py-[14px] rounded-[12px] border-none text-[15px] font-extrabold cursor-pointer mt-1"
              style={{ background: 'var(--accent)', color: '#fff', fontFamily: 'inherit' }}>
              Создать пикник
            </button>
          </div>

          {/* Войти по коду */}
          <div style={{ gridArea: '1/1', visibility: tab === 'join' ? 'visible' : 'hidden' }}>
            <div className="mb-3">
              <label className="block text-[11px] font-extrabold mb-[6px] uppercase tracking-wider" style={{ color: 'var(--muted)' }}>Код приглашения</label>
              <input
                style={{ ...inputStyle, textTransform: 'uppercase', letterSpacing: '.1em', fontSize: 18, textAlign: 'center', lineHeight: '1.2' }}
                value={code} onChange={e => setCode(e.target.value)} placeholder="XXXXXX" maxLength={6} />
            </div>
            <button onClick={doJoin}
              className="w-full py-[14px] rounded-[12px] border-none text-[15px] font-extrabold cursor-pointer mt-1"
              style={{ background: 'var(--accent)', color: '#fff', fontFamily: 'inherit' }}>
              Присоединиться
            </button>
          </div>
        </div>

        {err && <div className="text-center text-[12px] mt-3" style={{ color: 'var(--red)' }}>{err}</div>}
      </div>
    </div>
  )
}
