import { fmt } from '../lib/session'
import { useWsStore } from '../stores/wsStore'
import { useSessionStore } from '../stores/sessionStore'
import { useToastStore } from '../stores/toastStore'

export function MyScreen() {
  const serverState = useWsStore(s => s.serverState)
  const send        = useWsStore(s => s.send)
  const me          = useSessionStore(s => s.me)
  const showToast   = useToastStore(s => s.show)

  const items       = serverState?.items ?? []
  const myItems     = items.filter(i => i.enabled && i.buyer_id === me?.id)
  const boughtItems = myItems.filter(i => i.bought && i.price > 0)
  const actualTotal = boughtItems.reduce((s, i) => s + i.price * i.qty, 0)
  const boughtCount = myItems.filter(i => i.bought).length
  const pct         = myItems.length ? Math.round(boughtCount / myItems.length * 100) : 0
  const sorted      = [...myItems.filter(i => !i.bought), ...myItems.filter(i => i.bought)]

  function toggleBought(id: string, val: boolean) {
    send({ type: 'item:update', id, field: 'bought', value: val })
  }

  function updatePrice(id: string, newPrice: string) {
    const price = parseFloat(newPrice) || 0
    send({ type: 'item:update', id, field: 'price', value: price })
    if (price > 0) showToast('Цена обновлена')
  }

  function changeQty(id: string, cur: number, d: number) {
    send({ type: 'item:update', id, field: 'qty', value: Math.max(0, +(cur + d).toFixed(2)) })
  }

  return (
    <div className="px-[14px] pt-2 pb-8 relative z-10">
      {/* Hero */}
      <div className="glass rounded-[20px] p-[18px] mb-3">
        <div className="text-base font-extrabold mb-[3px]">Привет, {me?.name}!</div>
        <div className="text-[12px]" style={{ color: 'var(--muted)' }}>
          {boughtItems.length > 0 ? `Потрачено по факту · ${boughtCount} из ${myItems.length} куплено` : 'Вноси цены когда покупаешь'}
        </div>
        <div className="text-[28px] font-black mt-[10px]" style={{ color: 'var(--accent)' }}>
          {boughtItems.length > 0 ? fmt(actualTotal) : `${myItems.length} поз.`}
        </div>
        <div className="h-[5px] rounded-full mt-[10px] overflow-hidden" style={{ background: 'rgba(255,255,255,.1)' }}>
          <div className="h-full rounded-full transition-all duration-500"
            style={{ width: `${pct}%`, background: 'linear-gradient(90deg,var(--accent),var(--green))' }} />
        </div>
      </div>

      {myItems.length === 0 && (
        <div className="text-center py-10" style={{ color: 'var(--muted)' }}>
          <div className="text-[44px] mb-[10px]">🛒</div>
          <div className="text-[14px] font-semibold leading-relaxed">
            Тебе пока ничего не назначено.<br />Перейди в список и выбери «Кто купит»!
          </div>
        </div>
      )}

      {sorted.map(it => {
        const price = it.price
        const qty   = it.qty
        return (
          <div key={it.id}
            className="glass rounded-[14px] p-[13px] flex items-start gap-3 mb-2 transition-all duration-200"
            style={{ borderColor: it.bought ? 'rgba(74,222,128,.3)' : 'var(--gb)', opacity: it.bought ? .65 : 1 }}>
            <div
              onClick={() => toggleBought(it.id, !it.bought)}
              className="flex items-center justify-center rounded-full flex-shrink-0 cursor-pointer mt-[1px] transition-all duration-200"
              style={{
                width: 28, height: 28,
                border:     it.bought ? '2px solid var(--green)' : '2px solid var(--gbs)',
                background: it.bought ? 'var(--green)' : 'transparent',
                color:      it.bought ? '#100e0b' : 'transparent',
                fontSize: 13,
              }}>
              ✓
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-bold">{it.name}</div>
              <div className="flex items-center gap-[5px] mt-[6px]">
                <button onClick={() => changeQty(it.id, qty, -0.5)}
                  className="flex items-center justify-center rounded-[7px] text-[13px] cursor-pointer border-none"
                  style={{ width: 22, height: 22, background: 'rgba(255,240,200,.06)', border: '1px solid var(--gbs)', color: 'var(--text)' }}>
                  −
                </button>
                <span className="text-[13px] font-bold">{qty}</span>
                <button onClick={() => changeQty(it.id, qty, 0.5)}
                  className="flex items-center justify-center rounded-[7px] text-[13px] cursor-pointer border-none"
                  style={{ width: 22, height: 22, background: 'rgba(255,240,200,.06)', border: '1px solid var(--gbs)', color: 'var(--text)' }}>
                  +
                </button>
                <span className="text-[11px]" style={{ color: 'var(--muted)' }}>{it.unit}</span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1 flex-shrink-0 ml-2">
              <div className="font-extrabold" style={{ color: price > 0 ? 'var(--accent)' : 'var(--muted)', fontSize: price > 0 ? 13 : 11 }}>
                {price > 0 ? fmt(price * qty) : 'нет цены'}
              </div>
              <div className="flex items-center gap-1">
                <input type="number" min="0" step="1"
                  defaultValue={price > 0 ? price : ''}
                  placeholder="0"
                  onBlur={e => updatePrice(it.id, e.target.value)}
                  className="text-right rounded-[8px] text-[12px] font-bold glass-input"
                  style={{ width: 64, padding: '4px 8px' }} />
                <span className="text-[10px]" style={{ color: 'var(--muted)' }}>₽/{it.unit}</span>
              </div>
            </div>
          </div>
        )
      })}

      {boughtCount > 0 && actualTotal > 0 && (
        <div className="text-center text-[12px] py-2" style={{ color: 'var(--muted)' }}>
          ✅ Куплено {boughtCount} из {myItems.length} · итого{' '}
          <b style={{ color: 'var(--accent)' }}>{fmt(actualTotal)}</b>
        </div>
      )}
    </div>
  )
}
