import { useProfileScreenVM } from './useProfileScreenVM'

export function ProfileScreen() {
  const { me, bio, setBio, saving, handleSave, goBack, goToFamily } = useProfileScreenVM()

  return (
    <div className="min-h-screen" style={{ padding: '0 0 40px' }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-12 pb-6">
        <button onClick={goBack}
          className="border-none bg-transparent cursor-pointer text-[22px] leading-none p-0"
          style={{ color: 'var(--muted)', fontFamily: 'inherit' }}>
          ←
        </button>
        <h1 className="text-[20px] font-extrabold flex-1" style={{ letterSpacing: '-0.02em' }}>
          Мой профиль
        </h1>
      </div>

      <div className="px-4 flex flex-col gap-4">
        {/* Имя */}
        <div className="glass rounded-[18px] p-4">
          <div className="text-[11px] font-extrabold uppercase tracking-wider mb-2" style={{ color: 'var(--muted)' }}>
            Имя
          </div>
          <div className="text-[17px] font-bold">{me?.name ?? '—'}</div>
        </div>

        {/* Обо мне */}
        <div className="glass rounded-[18px] p-4">
          <div className="text-[11px] font-extrabold uppercase tracking-wider mb-3" style={{ color: 'var(--muted)' }}>
            Обо мне
          </div>
          <textarea
            value={bio}
            onChange={e => setBio(e.target.value)}
            maxLength={500}
            rows={4}
            placeholder="Аллергии, предпочтения, ограничения в еде…"
            className="w-full text-[14px] rounded-[10px] p-3 border-none resize-none outline-none"
            style={{
              background: 'var(--surface-white-10)',
              color: 'var(--text)',
              fontFamily: 'inherit',
              lineHeight: 1.5,
            }}
          />
          <div className="flex items-center justify-between mt-2">
            <span className="text-[11px]" style={{ color: 'var(--muted)' }}>{bio.length}/500</span>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 rounded-[10px] text-[13px] font-extrabold border-none cursor-pointer"
              style={{
                background: 'var(--accent)',
                color: 'var(--text-on-accent)',
                opacity: saving ? 0.6 : 1,
                fontFamily: 'inherit',
              }}>
              {saving ? 'Сохраняю…' : 'Сохранить'}
            </button>
          </div>
        </div>

        {/* Семья */}
        <button
          onClick={goToFamily}
          className="glass rounded-[18px] p-4 flex items-center justify-between w-full border-none cursor-pointer text-left"
          style={{ fontFamily: 'inherit' }}>
          <div>
            <div className="text-[15px] font-bold">👨‍👩‍👧 Моя семья</div>
            <div className="text-[12px] mt-[2px]" style={{ color: 'var(--muted)' }}>
              Участники, которые идут с тобой
            </div>
          </div>
          <span className="text-[18px]" style={{ color: 'var(--muted)' }}>›</span>
        </button>
      </div>
    </div>
  )
}
