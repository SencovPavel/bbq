import { Modal, GlassInput }                          from '@shared/ui/Modal'
import { UserAvatar }                                 from '@entities/member/ui/UserAvatar'
import { BackButton, GlassIconButton }                from '@shared/ui/GlassIconButton'
import { NavRow }                                     from '@shared/ui/NavRow'
import { StatBox }                                    from '@shared/ui/StatBox'
import { Chip }                                       from '@shared/ui/Chip'
import { IconFlag, IconPencil, IconCrown, IconPerson } from '@shared/ui/Icon'

import { useProfileScreenVM }                         from './useProfileScreenVM'

// ── Helpers ───────────────────────────────────────────────────────────────────

function plural(n: number, one: string, few: string, many: string): string {
  const mod10  = n % 10
  const mod100 = n % 100
  if (mod10 === 1 && mod100 !== 11) return one
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few
  return many
}

// ── ProfileScreen ─────────────────────────────────────────────────────────────

export function ProfileScreen() {
  const {
    me,
    groupCount, familyCount,
    editOpen, setEditOpen, draftBio, setDraftBio, openEdit,
    saving, handleSave,
    goBack, goToFamily,
  } = useProfileScreenVM()

  const familyMeta = familyCount > 0
    ? `${familyCount} ${plural(familyCount, 'человек', 'человека', 'человек')} · кто ходит с тобой`
    : 'Добавь, кто ходит с тобой'

  return (
    <div className="pb-10">

      {/* Header */}
      <div className="flex items-center gap-3 pb-6">
        <BackButton onClick={goBack} />
        <h1 className="text-[20px] font-extrabold flex-1" style={{ letterSpacing: '-0.02em' }}>
          Профиль
        </h1>
      </div>

      <div className="lg:px-0 flex flex-col gap-3">

        {/* ── Hero ─────────────────────────────────────────────────────────── */}
        <div className="glass rounded-[18px] overflow-hidden">
          <div className="p-4 pt-[18px]">
            <div className="flex items-center gap-3.5">
              <UserAvatar name={me?.name ?? ''} size={62} isAdmin={me?.is_admin} />

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-[7px] flex-wrap">
                  <span className="text-[19px] font-black" style={{ letterSpacing: '-.02em' }}>
                    {me?.name ?? '—'}
                  </span>
                  {me?.is_admin && (
                    <Chip
                      tint="fire"
                      icon={<IconCrown size={9} />}
                      style={{ fontSize: 9.5, padding: '2px 7px', textTransform: 'uppercase', letterSpacing: '.06em' }}
                    >
                      Админ
                    </Chip>
                  )}
                </div>
                {me?.username && (
                  <div className="text-[12.5px] font-semibold mt-[3px]" style={{ color: 'var(--muted)' }}>
                    @{me.username}
                  </div>
                )}
              </div>

              <GlassIconButton onClick={openEdit} title="Редактировать">
                <IconPencil size={14} />
              </GlassIconButton>
            </div>

            {/* Статистика */}
            <div className="flex gap-2.5 mt-4">
              <StatBox value={groupCount}  label={plural(groupCount,  'группа', 'группы', 'групп')} />
              <StatBox value={familyCount} label="в семье" />
            </div>
          </div>
        </div>

        <div className="cards-grid--fit">
          {/* ── Обо мне (read-only) ───────────────────────────────────────────── */}
          <div className="glass rounded-[18px] p-4">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[11px] font-extrabold uppercase tracking-wider" style={{ color: 'var(--muted)' }}>
                Обо мне
              </span>
              <button
                onClick={openEdit}
                className="inline-flex items-center gap-1 text-xs font-bold border-none bg-transparent cursor-pointer p-0"
                style={{ color: 'var(--accent)', fontFamily: 'inherit' }}
              >
                <IconPencil size={12} /> {me?.bio ? 'Изменить' : 'Добавить'}
              </button>
            </div>
            {me?.bio ? (
              <p className="text-[13.5px] leading-relaxed m-0" style={{ wordBreak: 'break-word' }}>
                {me.bio}
              </p>
            ) : (
              <p className="text-[13px] leading-normal m-0 italic" style={{ color: 'var(--muted)' }}>
                Расскажи коротко о себе — что обычно берёшь на себя в общих делах
              </p>
            )}
          </div>

          {/* ── Навигация ─────────────────────────────────────────────────────── */}
          <div className="glass rounded-[18px] overflow-hidden">
            <NavRow
              icon={<IconPerson size={18} strokeWidth={1.8} />}
              iconBg="var(--surface-violet-14)" iconColor="#c4b5fd"
              title="Моя семья"
              meta={familyMeta}
              onClick={goToFamily}
            />
            <div className="h-px mx-[15px]" style={{ background: 'var(--gb)' }} />
            <NavRow
              icon={<IconFlag size={17} strokeWidth={1.8} />}
              iconBg="var(--surface-success-13)" iconColor="var(--green)"
              title="Предпочтения и ограничения"
              meta="Аллергии, вегетарианство, не ем острое"
              soon
            />
          </div>
        </div>

        {/* ── Футер ────────────────────────────────────────────────────────── */}
        <div
          className="text-center text-[11px] mt-0.5 leading-normal"
          style={{ color: 'var(--muted)', opacity: .6 }}
        >
          Профиль виден участникам твоих групп
        </div>

      </div>

      {/* ── Edit sheet ────────────────────────────────────────────────────────── */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Редактировать профиль">
        <div className="flex flex-col gap-3">

          {/* Имя (только чтение) */}
          <div>
            <GlassInput
              label="Имя"
              value={me?.name ?? ''}
              disabled
              style={{ opacity: .6 }}
            />
            <div className="-mt-2 text-[11px]" style={{ color: 'var(--muted)', opacity: .7 }}>
              Имя из Telegram — не редактируется
            </div>
          </div>

          {/* Bio */}
          <div>
            <label
              className="block text-[11px] font-extrabold mb-[6px] uppercase tracking-wider"
              style={{ color: 'var(--muted)' }}
            >
              Обо мне
            </label>
            <textarea
              value={draftBio}
              onChange={e => setDraftBio(e.target.value)}
              rows={4}
              maxLength={200}
              autoFocus
              placeholder="Что любишь готовить, за что отвечаешь…"
              className="glass-input w-full"
              style={{ padding: '11px 14px', borderRadius: 12, fontSize: 14, lineHeight: 1.5, resize: 'none' }}
            />
            <div className="text-right text-[10.5px] mt-1" style={{ color: 'var(--muted)', opacity: .7 }}>
              {draftBio.length}/200
            </div>
          </div>

          {/* Кнопки */}
          <div className="grid grid-cols-2 gap-[10px] mt-1">
            <button
              onClick={() => setEditOpen(false)}
              className="p-[13px] rounded-xl text-sm font-extrabold cursor-pointer border-none"
              style={{
                background: 'var(--surface-strong)',
                border: '1px solid var(--gb)',
                color: 'var(--muted)',
                fontFamily: 'inherit',
              }}
            >
              Отмена
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="p-[13px] rounded-xl text-sm font-extrabold cursor-pointer border-none"
              style={{
                background: 'var(--accent)',
                color: 'var(--text-on-accent)',
                opacity: saving ? 0.6 : 1,
                fontFamily: 'inherit',
              }}
            >
              {saving ? 'Сохраняю…' : 'Сохранить'}
            </button>
          </div>

        </div>
      </Modal>

    </div>
  )
}
