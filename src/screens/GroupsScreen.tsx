import { IconFlame, IconUsers } from '@shared/ui/Icon'
import { groupTint, TINT_STYLES } from '@shared/lib/group-icon'
import { UserAvatar } from '@entities/member/ui/UserAvatar'
import { useGroupsScreenVM } from './useGroupsScreenVM'

interface GroupsScreenProps {
  onEnter: (gId: string) => void
  onCreate: () => void
  onJoin: () => void
}

export function GroupsScreen({ onEnter, onCreate, onJoin }: GroupsScreenProps) {
  const { me, groups, loading, goToProfile } = useGroupsScreenVM()

  return (
    <div className="w-full">
        <div className="flex items-center justify-between mb-1 lg:hidden">
          <div className="flex items-center gap-[6px] text-[22px] font-black" style={{ color: 'var(--accent)', fontFamily: 'inherit' }}>
            <IconFlame size={22} strokeWidth={1.4} /> Котёл
          </div>
          <button
            onClick={goToProfile}
            title="Мой профиль"
            className="flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-pill border-none cursor-pointer"
            style={{
              background: 'rgba(255,255,255,.04)',
              border: '1px solid var(--gb)',
              fontFamily: 'inherit',
            }}
          >
            <UserAvatar name={me?.name ?? ''} size={28} isAdmin={me?.is_admin} />
            <span className="text-[12.5px] font-extrabold" style={{ color: 'var(--text)' }}>Профиль</span>
          </button>
        </div>
        <div className="text-[13px] mb-6 lg:hidden" style={{ color: 'var(--muted)' }}>
          {me?.name ? `Привет, ${me.name}!` : 'Планируй закупки вместе с друзьями'}
        </div>
        <div className="hidden lg:flex items-center justify-between mb-1">
          <div className="text-[20px] font-extrabold">Мои группы</div>
          <button
            onClick={goToProfile}
            title="Мой профиль"
            className="flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-full border-none cursor-pointer"
            style={{
              background: 'rgba(255,240,200,0.06)',
              border: '1px solid var(--card-b)',
              fontFamily: 'inherit',
            }}
          >
            <UserAvatar name={me?.name ?? ''} size={26} isAdmin={me?.is_admin} />
            <span className="text-[12.5px] font-extrabold" style={{ color: 'var(--text)' }}>Профиль</span>
          </button>
        </div>
        <div className="hidden lg:block text-[13px] mb-6" style={{ color: 'var(--muted)' }}>
          {me?.name ? `Привет, ${me.name}!` : 'Выберите группу или создайте новую'}
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
          {groups.map(g => {
            const tint = TINT_STYLES[groupTint(g.id)]
            return (
            <div key={g.id}
              onClick={() => onEnter(g.id)}
              className="glass rounded-[16px] p-4 mb-[10px] flex items-center gap-3 cursor-pointer active:opacity-80 transition-opacity">
              <div className="flex items-center justify-center rounded-[12px] flex-shrink-0"
                style={{
                  width: 46,
                  height: 46,
                  color: 'var(--accent)',
                  background: `linear-gradient(135deg, ${tint.from}, ${tint.to})`,
                  border: `1px solid ${tint.border}`,
                }}>
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
            )
          })}
        </div>

        <div className="grid grid-cols-2 gap-[10px]">
          <button onClick={onCreate}
            className="py-[14px] rounded-[14px] border-none text-[14px] font-extrabold cursor-pointer"
            style={{ background: 'var(--accent)', color: 'var(--text-on-accent)', fontFamily: 'inherit' }}>
            ＋ Новая группа
          </button>
          <button onClick={onJoin}
            className="py-[14px] rounded-[14px] text-[14px] font-extrabold cursor-pointer border-none"
            style={{ background: 'var(--g)', border: '1px solid var(--gb)', color: 'var(--text)', fontFamily: 'inherit' }}>
            Войти по коду
          </button>
        </div>
    </div>
  )
}
