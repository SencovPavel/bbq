import { useEffect, useState } from 'react'

import { Modal } from '@shared/ui/Modal'
import { IconQrScan, IconCheck, IconCheckCircle, IconAlertTriangle } from '@shared/ui/Icon'
import { parseFnsQr, type FnsReceiptInfo } from '@shared/lib/fns-receipt'
import { getPlatform, scanQr } from '@shared/lib/tg'
import { fmt } from '@shared/lib/session'
import { useWsStore } from '@stores/wsStore'
import { useToastStore } from '@stores/toastStore'

interface ReceiptScannerProps {
  open: boolean
  onClose: () => void
  eventId: string | null
}

type Stage = 'scan' | 'review'

/**
 * Сканер чека. QR-строка ФНС даёт только сумму/дату — позиционный состав чека без
 * платного внешнего сервиса не получить (см. README плана). Поэтому после скана
 * пользователь сам отмечает, какие позиции из текущего списка покрывает этот чек,
 * и вводит цену — сумма отмеченных позиций сверяется с суммой чека как ориентир.
 */
export function ReceiptScanner({ open, onClose, eventId }: ReceiptScannerProps) {
  const items    = useWsStore(s => s.serverState?.items ?? [])
  const send     = useWsStore(s => s.send)
  const showToast = useToastStore(s => s.show)

  const [stage,   setStage]   = useState<Stage>('scan')
  const [raw,     setRaw]     = useState('')
  const [receipt, setReceipt] = useState<FnsReceiptInfo | null>(null)
  const [checked, setChecked] = useState<Record<string, boolean>>({})
  const [prices,  setPrices]  = useState<Record<string, string>>({})

  const canNativeScan = getPlatform() === 'telegram'

  useEffect(() => {
    if (!open) return
    setStage('scan')
    setRaw('')
    setReceipt(null)
    setChecked({})
    setPrices({})
  }, [open])

  const unboughtItems = items.filter(i => i.event_id === eventId && !i.bought)

  function handleParsed(text: string) {
    const parsed = parseFnsQr(text)
    if (!parsed) {
      showToast('Не удалось распознать QR чека', 'error')
      return
    }
    const initialPrices: Record<string, string> = {}
    unboughtItems.forEach(i => { if (i.price > 0) initialPrices[i.id] = String(i.price) })
    setPrices(initialPrices)
    setReceipt(parsed)
    setStage('review')
  }

  function handleNativeScan() {
    scanQr(handleParsed, 'Наведи камеру на QR-код чека')
  }

  function handleManualSubmit() {
    if (!raw.trim()) {
      showToast('Вставьте строку QR с чека', 'muted')
      return
    }
    handleParsed(raw)
  }

  function toggleChecked(id: string) {
    setChecked(p => ({ ...p, [id]: !p[id] }))
  }

  const checkedIds  = Object.keys(checked).filter(id => checked[id])
  const checkedSum  = checkedIds.reduce((s, id) => s + (parseFloat(prices[id]?.replace(',', '.') ?? '') || 0), 0)
  const sumsMatch    = receipt != null && Math.abs(checkedSum - receipt.total) < 1

  function handleApply() {
    for (const id of checkedIds) {
      const price = parseFloat(prices[id]?.replace(',', '.') ?? '') || 0
      send({ type: 'item:update', id, field: 'price', value: price })
      send({ type: 'item:update', id, field: 'bought', value: true })
    }
    showToast(`Отмечено позиций: ${checkedIds.length}`)
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="Сканировать чек">
      {stage === 'scan' && (
        <>
          <div
            className="flex items-center justify-center rounded-[14px] mx-auto mb-3"
            style={{ width: 52, height: 52, background: 'var(--surface-fire-14)', border: '1px solid var(--surface-fire-25)', color: 'var(--accent)' }}
          >
            <IconQrScan size={22} strokeWidth={1.6} />
          </div>

          {canNativeScan ? (
            <>
              <p className="text-sm mb-4 leading-relaxed text-center" style={{ color: 'var(--muted)' }}>
                Отсканируй QR-код на кассовом чеке — распознаем сумму и дату покупки.
              </p>
              <button
                type="button"
                onClick={handleNativeScan}
                className="w-full py-3 rounded-md border-none text-sm font-extrabold cursor-pointer flex items-center justify-center gap-2"
                style={{ background: 'var(--accent)', color: 'var(--text-on-accent)', fontFamily: 'inherit' }}
              >
                <IconQrScan size={15} strokeWidth={2} /> Сканировать QR
              </button>
            </>
          ) : (
            <>
              <p className="text-sm mb-3 leading-relaxed text-center" style={{ color: 'var(--muted)' }}>
                Вставьте данные QR-кода с кассового чека (формат ФНС) — распознаем сумму и дату покупки.
              </p>
              <textarea
                value={raw}
                onChange={e => setRaw(e.target.value)}
                placeholder="t=20260530T1142&s=4280.00&fn=..."
                rows={4}
                className="glass-input w-full rounded-md p-3 text-sm mb-4 resize-none"
                style={{ fontFamily: 'inherit' }}
              />
              <button
                type="button"
                onClick={handleManualSubmit}
                className="w-full py-3 rounded-md border-none text-sm font-extrabold cursor-pointer"
                style={{ background: 'var(--accent)', color: 'var(--text-on-accent)', fontFamily: 'inherit' }}
              >
                Продолжить
              </button>
            </>
          )}
        </>
      )}

      {stage === 'review' && receipt && (
        <>
          <div
            className="flex items-center justify-between gap-3 rounded-[12px] p-3 mb-4"
            style={{ background: 'var(--surface-fire-8)', border: '1px solid var(--surface-fire-20)' }}
          >
            <div>
              <div className="text-[11px] font-extrabold uppercase tracking-wider" style={{ color: 'var(--muted)' }}>
                Сумма чека
              </div>
              <div className="text-[18px] font-black tabular-nums" style={{ color: 'var(--accent)' }}>
                {fmt(receipt.total)}
              </div>
            </div>
            {receipt.date && (
              <div className="text-[12px]" style={{ color: 'var(--muted)' }}>{receipt.date}</div>
            )}
          </div>

          <p className="text-[12px] mb-3 leading-relaxed" style={{ color: 'var(--muted)' }}>
            Отметь, какие позиции покрывает этот чек, и укажи цену за каждую.
          </p>

          {unboughtItems.length === 0 ? (
            <div className="text-center text-sm py-4" style={{ color: 'var(--muted)' }}>
              Все позиции уже отмечены как купленные
            </div>
          ) : (
            <div className="flex flex-col gap-2 mb-4" style={{ maxHeight: 280, overflowY: 'auto' }}>
              {unboughtItems.map(item => (
                <label
                  key={item.id}
                  className="flex items-center gap-2.5 rounded-[10px] p-2.5"
                  style={{ background: 'var(--surface-input)', border: '1px solid var(--gb)', cursor: 'pointer' }}
                >
                  <input
                    type="checkbox"
                    checked={!!checked[item.id]}
                    onChange={() => toggleChecked(item.id)}
                  />
                  <span className="flex-1 min-w-0 text-[13px] font-semibold truncate">{item.name}</span>
                  <input
                    type="number"
                    min="0"
                    inputMode="decimal"
                    value={prices[item.id] ?? ''}
                    onChange={e => setPrices(p => ({ ...p, [item.id]: e.target.value }))}
                    onClick={e => e.stopPropagation()}
                    placeholder="0"
                    className="glass-input text-right text-[12px] font-bold"
                    style={{ width: 64, padding: '4px 8px' }}
                  />
                </label>
              ))}
            </div>
          )}

          {checkedIds.length > 0 && (
            <div
              className="flex items-center gap-2 rounded-[10px] p-2.5 mb-4 text-[12px] font-semibold"
              style={{
                background: sumsMatch ? 'var(--surface-success-12)' : 'var(--surface-amber-10)',
                color: sumsMatch ? 'var(--green)' : 'var(--accent-2)',
              }}
            >
              {sumsMatch ? <IconCheckCircle size={14} /> : <IconAlertTriangle size={14} />}
              {sumsMatch
                ? 'Сумма сходится с чеком'
                : `Отмечено на ${fmt(checkedSum)} — сумма чека ${fmt(receipt.total)}`}
            </div>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setStage('scan')}
              className="flex-1 py-3 rounded-md border-none text-sm font-extrabold cursor-pointer"
              style={{ background: 'var(--surface-strong)', color: 'var(--muted)', fontFamily: 'inherit' }}
            >
              Назад
            </button>
            <button
              type="button"
              onClick={handleApply}
              disabled={checkedIds.length === 0}
              className="flex-[2] py-3 rounded-md border-none text-sm font-extrabold cursor-pointer flex items-center justify-center gap-2"
              style={{
                background: 'var(--accent)', color: 'var(--text-on-accent)', fontFamily: 'inherit',
                opacity: checkedIds.length === 0 ? 0.5 : 1,
              }}
            >
              <IconCheck size={15} strokeWidth={2.4} /> Применить ({checkedIds.length})
            </button>
          </div>
        </>
      )}
    </Modal>
  )
}
