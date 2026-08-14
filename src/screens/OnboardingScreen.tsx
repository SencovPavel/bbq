import type { CSSProperties } from 'react'
import { IconPerson, IconSparkles } from '@shared/ui/Icon'
import { BrandLockup } from '@shared/ui/BrandLockup'
import { BackButton } from '@shared/ui/GlassIconButton'
import { SegmentedControl } from '@shared/ui/SegmentedControl'
import { useOnboardingScreenVM, type OnboardingTab } from './useOnboardingScreenVM'
import type { User } from '@shared/types'

interface OnboardingScreenProps {
  onDone: (user: User, gId: string) => void
}

export function OnboardingScreen({ onDone }: OnboardingScreenProps) {
  const {
    me, tab, switchTab, err,
    groupName, setGroupName,
    code, setCode,
    hasTg, canAuth,
    doCreate, doJoin,
    goBack,
  } = useOnboardingScreenVM(onDone)

  const inputStyle: CSSProperties = {
    width: '100%', padding: '12px 14px',
    border: '1px solid var(--gb)', borderRadius: 12,
    background: 'var(--surface-input)', color: 'var(--text)',
    fontFamily: 'inherit', fontSize: 14, fontWeight: 600, outline: 'none',
  }

  return (
    <div className="w-full">
      <div className="flex items-center gap-3 mb-4">
        <BackButton onClick={goBack} />
        <div className="lg:hidden">
          <BrandLockup size="lg" as="h1" />
        </div>
      </div>
      <div className="text-[13px] mb-6 lg:mb-8 text-center lg:text-left" style={{ color: 'var(--muted)' }}>
        Организуй что угодно вместе — от пикника до переезда.
      </div>

      <div className="lg:p-0 lg:bg-transparent lg:border-none rounded-[20px] p-5 w-full glass lg:shadow-none">
        {/* Tabs */}
        <div className="mb-5">
          <SegmentedControl
            value={tab}
            onChange={v => switchTab(v as OnboardingTab)}
            label="Способ входа"
            options={[
              { value: 'create', label: '＋ Создать группу' },
              { value: 'join', label: 'Войти по коду' },
            ]}
          />
        </div>

        {hasTg && (
          <div className="rounded-xl px-3 py-[10px] mb-3 text-[12px]"
            style={{ background: 'var(--surface-white-6)', border: '1px solid var(--gb)', color: 'var(--muted)' }}>
            <span className="inline-flex items-center gap-[5px]">
              <IconPerson size={12} strokeWidth={2} /> Войдёшь как <b style={{ color: 'var(--text)' }}>{me!.name}</b>
            </span>
          </div>
        )}

        {!canAuth && (
          <div className="mb-3 rounded-xl px-3 py-[10px] text-[12px]"
            style={{ background: 'var(--surface-danger-10)', border: '1px solid var(--surface-danger-30)', color: 'var(--red)' }}>
            Для создания или входа в группу нужен аккаунт на сайте или Telegram Mini App.
          </div>
        )}

        {/* Both tabs in the same grid cell — card height = max(both) */}
        <div style={{ display: 'grid' }}>
          {/* Создать */}
          <div style={{ gridArea: '1/1', visibility: tab === 'create' ? 'visible' : 'hidden' }}>
            <div className="mb-3">
              <label className="block text-[11px] font-extrabold mb-[6px] uppercase tracking-wider" style={{ color: 'var(--muted)' }}>Название группы</label>
              <input style={inputStyle} value={groupName} onChange={e => setGroupName(e.target.value)} placeholder="Пикник на даче" />
            </div>
            <button onClick={doCreate}
              className="w-full py-[14px] rounded-[12px] border-none text-[15px] font-extrabold cursor-pointer mt-1"
              style={{
                background: 'var(--accent)', color: 'var(--text-on-accent)', fontFamily: 'inherit',
                boxShadow: 'var(--shadow-brand-md)',
                opacity: groupName.trim() ? 1 : 0.5,
              }}>
              Создать группу
            </button>
          </div>

          {/* Войти по коду */}
          <div style={{ gridArea: '1/1', visibility: tab === 'join' ? 'visible' : 'hidden' }}>
            <div className="mb-3">
              <label className="block text-[11px] font-extrabold mb-[6px] uppercase tracking-wider" style={{ color: 'var(--muted)' }}>Код приглашения</label>
              <input
                style={{
                  ...inputStyle,
                  textTransform: 'uppercase',
                  letterSpacing: '.2em',
                  fontSize: 'var(--t-xl)',
                  fontWeight: 900,
                  textAlign: 'center',
                  lineHeight: '1.2',
                }}
                value={code} onChange={e => setCode(e.target.value)} placeholder="XXXXXX" maxLength={6} />
            </div>
            <button onClick={doJoin}
              className="w-full py-[14px] rounded-[12px] border-none text-[15px] font-extrabold cursor-pointer mt-1"
              style={{
                background: 'var(--accent)', color: 'var(--text-on-accent)', fontFamily: 'inherit',
                boxShadow: 'var(--shadow-brand-md)',
                opacity: code.trim() ? 1 : 0.5,
              }}>
              Присоединиться
            </button>
          </div>
        </div>

        {err && <div className="text-center text-[12px] mt-3" style={{ color: 'var(--red)' }}>{err}</div>}
      </div>

      <div
        className="mt-4 flex items-start gap-2.5 rounded-[12px]"
        style={{ background: 'rgba(96,165,250,.06)', border: '1px solid rgba(96,165,250,.18)', padding: '12px 14px' }}
      >
        <span style={{ color: 'var(--blue)', flexShrink: 0, marginTop: 1 }}><IconSparkles size={15} /></span>
        <div className="text-[12px] leading-relaxed" style={{ color: 'var(--muted-2)' }}>
          Подключи Telegram-чат — агент сам соберёт задачи и пункты из обсуждения
        </div>
      </div>
    </div>
  )
}
