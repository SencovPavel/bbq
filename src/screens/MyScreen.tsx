import { NoEventsPrompt }  from '@widgets/NoEventsPrompt'
import { EmptyState } from '@shared/ui/EmptyState'
import { Stepper } from '@shared/ui/Stepper'
import { UserAvatar } from '@entities/member/ui/UserAvatar'
import { ReceiptScanner } from '@widgets/ReceiptScanner'
import { IconCart, IconCheck, IconQrScan } from '@shared/ui/Icon'
import { PriceCell } from '@entities/item/ui/PriceCell'
import { CompletedEventBanner } from '@entities/event/ui/CompletedEventBanner'
import { useMyScreenVM } from './useMyScreenVM'

// ── RsvpRow ───────────────────────────────────────────────────────────────────

function RsvpRow({ name, label, attending, onToggle }: {
  name: string
  label?: string
  attending: boolean
  onToggle: () => void
}) {
  return (
    <div className="flex items-center justify-between mb-1.5">
      <div className="flex items-baseline gap-1.5 min-w-0">
        <span className="text-[13px] font-semibold truncate">{name}</span>
        {label && (
          <span className="text-[11px] shrink-0" style={{ color: 'var(--muted)' }}>{label}</span>
        )}
      </div>
      <button
        type="button"
        onClick={onToggle}
        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-pill text-[11px] font-extrabold border transition-all active:scale-95 shrink-0 ml-2"
        style={{
          background:  attending ? 'var(--surface-success-12)' : 'rgba(248,113,113,.10)',
          borderColor: attending ? 'var(--surface-success-35)' : 'rgba(248,113,113,.30)',
          color:       attending ? 'var(--green)' : 'var(--red)',
          fontFamily:  'inherit',
          cursor:      'pointer',
        }}
      >
        {attending ? '✓ Иду' : '✕ Не иду'}
      </button>
    </div>
  )
}

export function MyScreen() {
  const vm = useMyScreenVM()
  const {
    me, events, myItems, sorted, amIAdmin,
    actualTotal, boughtItems, boughtCount, pct, listLocked, hasBudget,
    amIAttending, currentEvent, toggleRsvp,
    myFamilyMembers, familyMemberAttending, toggleFamilyRsvp,
    scanOpen, setScanOpen,
    toggleBought, updatePrice, changeQty, showLockedToast, setShowEventSheet,
    goToFamily,
    fmt, currentEventId,
  } = vm

  if (!events.length) {
    return (
      <div className="px-3.5 pt-2 pb-8 relative">
        <NoEventsPrompt isAdmin={amIAdmin} onCreate={() => setShowEventSheet(true)} />
      </div>
    )
  }

  return (
    <>
      <div className="px-3.5 pt-2 pb-8 relative">
        {listLocked && <CompletedEventBanner />}

        <div className="glass rounded-lg p-5 mb-3">
          <div className="flex items-center gap-3 mb-3">
            <UserAvatar name={me?.name ?? '?'} size={48} isAdmin={amIAdmin} />
            <div className="flex-1 min-w-0">
              <div className="text-base font-black">Привет, {me?.name}!</div>
              <div className="text-[11.5px] mt-0.5 font-semibold" style={{ color: 'var(--muted)' }}>
                {myItems.length > 0
                  ? `${boughtCount} из ${myItems.length} ${hasBudget ? 'куплено' : 'сделано'}`
                  : 'Вноси отметки, когда готово'}
              </div>
            </div>
            {hasBudget && (
              <button
                type="button"
                title="Отсканировать чек"
                onClick={() => {
                  if (listLocked) { showLockedToast(); return }
                  setScanOpen(true)
                }}
                disabled={listLocked}
                className="h-[38px] px-3 pl-[11px] rounded-pill shrink-0 inline-flex items-center gap-1.5
                           text-xs font-extrabold border active:scale-95 transition"
                style={{
                  background: 'var(--gradient-hero-my)',
                  borderColor: 'var(--surface-fire-32)',
                  color: 'var(--accent)',
                  fontFamily: 'inherit',
                  cursor: listLocked ? 'default' : 'pointer',
                  opacity: listLocked ? 0.45 : 1,
                }}
              >
                <IconQrScan size={15} strokeWidth={2} />
                <span>Чек</span>
              </button>
            )}
          </div>

          {currentEvent && (
            <>
              <div className="h-px my-3" style={{ background: 'var(--surface-white-10)' }} />

              {/* Явка — заголовок */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-extrabold uppercase tracking-wider" style={{ color: 'var(--muted)' }}>
                  Явка
                </span>
                <button
                  type="button"
                  onClick={goToFamily}
                  className="text-[11px] font-bold border-none bg-transparent cursor-pointer"
                  style={{ color: 'var(--muted)', fontFamily: 'inherit' }}
                >
                  Управление семьёй →
                </button>
              </div>

              {/* Я */}
              <RsvpRow
                name={`${me?.name ?? '...'} (я)`}
                attending={amIAttending}
                onToggle={toggleRsvp}
              />

              {/* Члены семьи */}
              {myFamilyMembers.map(fm => (
                <RsvpRow
                  key={fm.id}
                  name={fm.name}
                  label={fm.label ?? undefined}
                  attending={familyMemberAttending(fm.id)}
                  onToggle={() => toggleFamilyRsvp(fm.id)}
                />
              ))}
            </>
          )}

          {hasBudget && (
            <>
              <div className="h-px my-3" style={{ background: 'var(--surface-white-10)' }} />
              <div className="text-[11px] font-extrabold uppercase tracking-wider mb-1" style={{ color: 'var(--muted)' }}>
                Потрачено по факту
              </div>
              <div className="text-display font-black tracking-tight tabular-nums" style={{ color: 'var(--accent)' }}>
                {boughtItems.length > 0 ? fmt(actualTotal) : `${myItems.length} поз.`}
              </div>
              <div className="h-[5px] rounded-full mt-2.5 overflow-hidden" style={{ background: 'var(--surface-white-10)' }}>
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${pct}%`, background: 'var(--gradient-progress)' }}
                />
              </div>
            </>
          )}
        </div>

        {myItems.length === 0 && (
          <EmptyState
            icon={<IconCart size={48} strokeWidth={1.4} />}
            title="Тебе ничего не назначено"
            body="Перейди в «Список» и нажми «+ покупатель» рядом с позицией"
          />
        )}

        {sorted.map(it => {
          const { price, qty } = it
          return (
            <div
              key={it.id}
              className="glass rounded-md p-3 flex items-start gap-3 mb-2 transition-all duration-200"
              style={{
                borderColor: it.bought ? 'var(--surface-success-30)' : 'var(--gb)',
                opacity: it.bought ? 0.65 : 1,
              }}
            >
              <div
                onClick={() => { if (!listLocked) toggleBought(it.id, !it.bought) }}
                className="flex items-center justify-center rounded-full shrink-0 mt-px transition-all duration-200"
                style={{
                  width: 28, height: 28,
                  border: it.bought ? '2px solid var(--green)' : '2px solid var(--gbs)',
                  background: it.bought ? 'var(--green)' : 'transparent',
                  color: it.bought ? 'var(--text-on-success)' : 'transparent',
                  cursor: listLocked ? 'default' : 'pointer',
                  opacity: listLocked ? 0.7 : 1,
                }}
              >
                <IconCheck size={13} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold">{it.name}</div>
                {it.kind !== 'task' && (
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <Stepper
                      label={qty}
                      onDec={() => changeQty(it.id, qty, -0.5)}
                      onInc={() => changeQty(it.id, qty, 0.5)}
                      disabled={listLocked}
                    />
                    <span className="text-[11px]" style={{ color: 'var(--muted)' }}>{it.unit}</span>
                  </div>
                )}
              </div>

              {hasBudget && it.kind !== 'task' && (
                <div className="flex flex-col items-end gap-1 shrink-0 ml-2">
                  <div
                    className="font-extrabold tabular-nums"
                    style={{ color: price > 0 ? 'var(--accent)' : 'var(--muted)', fontSize: price > 0 ? 13 : 11 }}
                  >
                    {price > 0 ? fmt(price * qty) : 'нет цены'}
                  </div>
                  <div className="flex items-center gap-1">
                    <PriceCell item={it} readOnly={listLocked} onChange={updatePrice} />
                    <span className="text-[10px]" style={{ color: 'var(--muted)' }}>₽/{it.unit}</span>
                  </div>
                </div>
              )}
            </div>
          )
        })}

        {boughtCount > 0 && hasBudget && actualTotal > 0 && (
          <div className="text-center text-xs py-2" style={{ color: 'var(--muted)' }}>
            Куплено {boughtCount} из {myItems.length} · итого{' '}
            <b style={{ color: 'var(--accent)' }}>{fmt(actualTotal)}</b>
          </div>
        )}
      </div>

      <ReceiptScanner
        open={scanOpen}
        onClose={() => setScanOpen(false)}
        eventId={currentEventId}
      />
    </>
  )
}
