import { useState } from 'react'

import { NoEventsPrompt } from '../components/NoEventsPrompt'
import { EmptyState } from '../components/states/EmptyState'
import { OfflineBanner } from '../components/states/OfflineBanner'
import { UserAvatar } from '../components/UserAvatar'
import { ReceiptScanner } from '../components/receipt/ReceiptScanner'
import { IconCart, IconCheck, IconQrScan } from '../components/Icon'
import { PriceCell } from '../components/PriceCell'
import { fmt } from '../lib/session'
import { useAppStore } from '../stores/appStore'
import { useSessionStore } from '../stores/sessionStore'
import { useToastStore } from '../stores/toastStore'
import { CompletedEventBanner } from '../components/states/CompletedEventBanner'
import { isEventItemsLocked } from '../lib/event-status'
import { useWsStore } from '../stores/wsStore'

export function MyScreen() {
  const serverState    = useWsStore(s => s.serverState)
  const wsOk           = useWsStore(s => s.wsOk)
  const send           = useWsStore(s => s.send)
  const me             = useSessionStore(s => s.me)
  const showToast      = useToastStore(s => s.show)
  const currentEventId    = useAppStore(s => s.currentEventId)
  const setShowEventSheet = useAppStore(s => s.setShowEventSheet)
  const [scanOpen, setScanOpen] = useState(false)

  const allItems    = serverState?.items ?? []
  const members     = serverState?.members ?? []
  const events      = serverState?.events ?? []
  const items       = currentEventId ? allItems.filter(i => i.event_id === currentEventId) : allItems
  const myItems     = items.filter(i => i.buyer_id === me?.id)
  const boughtItems = myItems.filter(i => i.bought && i.price > 0)
  const actualTotal = boughtItems.reduce((s, i) => s + i.price * i.qty, 0)
  const boughtCount = myItems.filter(i => i.bought).length
  const pct         = myItems.length ? Math.round(boughtCount / myItems.length * 100) : 0
  const amIAdmin    = members.find(m => m.user_id === me?.id)?.is_admin ?? false
  const currentEvent = currentEventId ? events.find(e => e.id === currentEventId) : undefined
  const listLocked  = isEventItemsLocked(currentEvent?.status)
  const sorted      = [...myItems].sort((a, b) => a.name.localeCompare(b.name, 'ru', { sensitivity: 'base' }))

  const showLockedToast = () => {
    showToast('Событие завершено — список только для просмотра', 'var(--muted)')
  }

  const toggleBought = (id: string, val: boolean) => {
    if (listLocked) { showLockedToast(); return }
    send({ type: 'item:update', id, field: 'bought', value: val })
  }

  const updatePrice = (id: string, price: number) => {
    if (listLocked) { showLockedToast(); return }
    send({ type: 'item:update', id, field: 'price', value: price })
    if (price > 0) showToast('Цена обновлена')
  }

  const changeQty = (id: string, cur: number, d: number) => {
    if (listLocked) { showLockedToast(); return }
    send({ type: 'item:update', id, field: 'qty', value: Math.max(0, +(Number(cur) + d).toFixed(2)) })
  }

  if (!events.length) {
    return (
      <div className="px-3.5 pt-2 pb-8 relative">
        {!wsOk && <OfflineBanner />}
        <NoEventsPrompt isAdmin={amIAdmin} onCreate={() => setShowEventSheet(true)} />
      </div>
    )
  }

  return (
    <>
      <div className="px-3.5 pt-2 pb-8 relative">
        {!wsOk && <OfflineBanner />}
        {listLocked && <CompletedEventBanner />}

        <div className="glass rounded-lg p-5 mb-3">
          <div className="flex items-center gap-3 mb-3">
            <UserAvatar name={me?.name ?? '?'} size={48} isAdmin={amIAdmin} />
            <div className="flex-1 min-w-0">
              <div className="text-base font-black">Привет, {me?.name}!</div>
              <div className="text-[11.5px] mt-0.5 font-semibold" style={{ color: 'var(--muted)' }}>
                {myItems.length > 0
                  ? `${boughtCount} из ${myItems.length} куплено`
                  : 'Вноси цены когда покупаешь'}
              </div>
            </div>
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
                background: 'linear-gradient(135deg, rgba(249,115,22,.18), rgba(251,191,36,.08))',
                borderColor: 'rgba(249,115,22,.32)',
                color: 'var(--accent)',
                fontFamily: 'inherit',
                cursor: listLocked ? 'default' : 'pointer',
                opacity: listLocked ? 0.45 : 1,
              }}
            >
              <IconQrScan size={15} strokeWidth={2} />
              <span>Чек</span>
            </button>
          </div>

          <div
            className="text-[11px] font-extrabold uppercase tracking-wider mb-1"
            style={{ color: 'var(--muted)' }}
          >
            Потрачено по факту
          </div>
          <div
            className="text-display font-black tracking-tight tabular-nums"
            style={{ color: 'var(--accent)' }}
          >
            {boughtItems.length > 0 ? fmt(actualTotal) : `${myItems.length} поз.`}
          </div>
          <div
            className="h-[5px] rounded-full mt-2.5 overflow-hidden"
            style={{ background: 'rgba(255,255,255,.1)' }}
          >
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${pct}%`,
                background: 'linear-gradient(90deg, var(--accent), var(--green))',
              }}
            />
          </div>
        </div>

        {myItems.length === 0 && (
          <EmptyState
            icon={<IconCart size={48} strokeWidth={1.4} />}
            title="Тебе ничего не назначено"
            body="Перейди в «Список» и нажми «+ покупатель» рядом с позицией"
          />
        )}

        {sorted.map(it => {
          const price = it.price
          const qty   = it.qty
          return (
            <div
              key={it.id}
              className="glass rounded-md p-3 flex items-start gap-3 mb-2 transition-all duration-200"
              style={{
                borderColor: it.bought ? 'rgba(74,222,128,.3)' : 'var(--gb)',
                opacity: it.bought ? 0.65 : 1,
              }}
            >
              <div
                onClick={() => { if (!listLocked) toggleBought(it.id, !it.bought) }}
                className="flex items-center justify-center rounded-full shrink-0 mt-px transition-all duration-200"
                style={{
                  width: 28,
                  height: 28,
                  border: it.bought ? '2px solid var(--green)' : '2px solid var(--gbs)',
                  background: it.bought ? 'var(--green)' : 'transparent',
                  color: it.bought ? '#100e0b' : 'transparent',
                  cursor: listLocked ? 'default' : 'pointer',
                  opacity: listLocked ? 0.7 : 1,
                }}
              >
                <IconCheck size={13} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold">{it.name}</div>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <button
                    type="button"
                    onClick={() => changeQty(it.id, qty, -0.5)}
                    disabled={listLocked}
                    className="flex items-center justify-center rounded-sm text-sm border size-[22px]"
                    style={{
                      background: 'rgba(255,240,200,.06)',
                      borderColor: 'var(--gbs)',
                      color: 'var(--text)',
                      cursor: listLocked ? 'default' : 'pointer',
                      opacity: listLocked ? 0.5 : 1,
                    }}
                  >
                    −
                  </button>
                  <span className="text-sm font-bold">{qty}</span>
                  <button
                    type="button"
                    onClick={() => changeQty(it.id, qty, 0.5)}
                    disabled={listLocked}
                    className="flex items-center justify-center rounded-sm text-sm border size-[22px]"
                    style={{
                      background: 'rgba(255,240,200,.06)',
                      borderColor: 'var(--gbs)',
                      color: 'var(--text)',
                      cursor: listLocked ? 'default' : 'pointer',
                      opacity: listLocked ? 0.5 : 1,
                    }}
                  >
                    +
                  </button>
                  <span className="text-[11px]" style={{ color: 'var(--muted)' }}>
                    {it.unit}
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0 ml-2">
                <div
                  className="font-extrabold tabular-nums"
                  style={{
                    color: price > 0 ? 'var(--accent)' : 'var(--muted)',
                    fontSize: price > 0 ? 13 : 11,
                  }}
                >
                  {price > 0 ? fmt(price * qty) : 'нет цены'}
                </div>
                <div className="flex items-center gap-1">
                  <PriceCell item={it} readOnly={listLocked} onChange={updatePrice} />
                  <span className="text-[10px]" style={{ color: 'var(--muted)' }}>
                    ₽/{it.unit}
                  </span>
                </div>
              </div>
            </div>
          )
        })}

        {boughtCount > 0 && actualTotal > 0 && (
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
