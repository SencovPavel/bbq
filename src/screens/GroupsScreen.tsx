import { useState, useEffect } from 'react'
import { getUserGroups } from '../lib/api'
import { IconFlame, IconUsers } from '../components/Icon'
import { useSessionStore } from '../stores/sessionStore'
import type { GroupSummary } from '../types'

interface GroupsScreenProps {
  onEnter: (gId: string) => void
  onCreate: () => void
  onJoin: () => void
}

export function GroupsScreen({ onEnter, onCreate, onJoin }: GroupsScreenProps) {
  const me = useSessionStore(s => s.me)

  const [groups,  setGroups]  = useState<GroupSummary[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!me?.id) { setLoading(false); return }
    getUserGroups(me.id)
      .then(setGroups)
      .catch(() => setGroups([]))
      .finally(() => setLoading(false))
  }, [me?.id])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 relative">
      <div className="w-full max-w-[360px]">
        <div className="flex items-center gap-[6px] text-[22px] font-black mb-1" style={{ color: 'var(--accent)', fontFamily: 'inherit' }}>
          <IconFlame size={22} strokeWidth={1.4} /> Пикник
        </div>
        <div className="text-[13px] mb-6" style={{ color: 'var(--muted)' }}>
          {me?.name ? `Привет, ${me.name}!` : 'Планируй пикник вместе с друзьями'}
        </div>

        <div className="flex-1 mb-4" style={{ minHeight: 80 }}>
          {loading && (
            <div className="text-center py-6 text-[13px]" style={{ color: 'var(--muted)' }}>Загрузка...</div>
          )}
          {!loading && groups.length === 0 && (
            <div className="text-center py-8">
              <div className="mb-2" style={{ color: 'var(--muted)', opacity: 0.45, display: 'inline-block' }}><IconUsers size={44} /></div>
              <div className="text-[13px] font-semibold leading-relaxed" style={{ color: 'var(--muted)' }}>
                У тебя пока нет групп.<br />Создай новую или войди по коду!
              </div>
            </div>
          )}
          {groups.map(g => (
            <div key={g.id}
              onClick={() => onEnter(g.id)}
              className="glass rounded-[16px] p-4 mb-[10px] flex items-center gap-3 cursor-pointer active:opacity-80 transition-opacity">
              <div className="flex items-center justify-center rounded-[12px] flex-shrink-0"
                style={{ width: 46, height: 46, color: 'var(--accent)',
                  background: 'linear-gradient(135deg,rgba(249,115,22,.25),rgba(251,191,36,.15))',
                  border: '1px solid rgba(249,115,22,.25)' }}>
                <IconFlame size={22} strokeWidth={1.5} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[15px] font-extrabold truncate">{g.name}</div>
                <div className="text-[11px] mt-[2px]" style={{ color: 'var(--muted)' }}>
                  {g.member_count} участн. · {g.item_count} позиций
                </div>
              </div>
              <div className="text-[18px]" style={{ color: 'var(--muted)' }}>›</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-[10px]">
          <button onClick={onCreate}
            className="py-[14px] rounded-[14px] border-none text-[14px] font-extrabold cursor-pointer"
            style={{ background: 'var(--accent)', color: '#fff', fontFamily: 'inherit' }}>
            ＋ Новая группа
          </button>
          <button onClick={onJoin}
            className="py-[14px] rounded-[14px] text-[14px] font-extrabold cursor-pointer border-none"
            style={{ background: 'var(--g)', border: '1px solid var(--gb)', color: 'var(--text)', fontFamily: 'inherit' }}>
            Войти по коду
          </button>
        </div>
      </div>
    </div>
  )
}
