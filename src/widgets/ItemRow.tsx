import { useState, useRef, useEffect } from 'react'
import { IconDots, IconPerson } from '@shared/ui/Icon'
import { Stepper } from '@shared/ui/Stepper'
import type { Item } from '@shared/types'

// ── Source badge ──────────────────────────────────────────────────────────────

type Source = 'chat' | 'agent' | 'manual'
const SOURCE_MAP: Record<Source, { bg: string; border: string; color: string; label: string }> = {
  chat:   { bg: 'var(--surface-info-12)',  border: 'var(--border-info)',      color: 'var(--color-info-muted)', label: 'из чата' },
  agent:  { bg: 'var(--surface-fire-12)', border: 'var(--surface-fire-25)',  color: 'var(--accent2)',           label: 'агент'   },
  manual: { bg: 'var(--surface-white-6)', border: 'var(--surface-white-14)', color: 'var(--muted)',             label: 'вручную' },
}

function SourceBadge({ source }: { source: Source }) {
  const s = SOURCE_MAP[source] ?? SOURCE_MAP.manual
  return (
    <span
      className="inline-flex items-center rounded-full text-[10px] font-bold ml-1 align-middle"
      style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.color, padding: '1px 7px' }}
    >
      {s.label}
    </span>
  )
}

// ── ItemRow ───────────────────────────────────────────────────────────────────

export interface ItemRowProps {
  item: Item
  meId?: string
  readOnly?: boolean
  hasBudget?: boolean
  onUpdate: (id: string, field: string, value: unknown) => void
  onBuyerTap: (id: string) => void
  onOpenActions: (id: string) => void
  renameTrigger: number
  stepForUnit: (unit: string) => number
  fmtQty: (qty: number, unit: string) => string
  fmt: (n: number) => string
}

export function ItemRow({ item, meId, readOnly = false, hasBudget = true, onUpdate, onBuyerTap, onOpenActions, renameTrigger, stepForUnit, fmtQty, fmt }: ItemRowProps) {
  // Qty: local optimistic state + debounce
  const [localQty, setLocalQty] = useState(() => Number(item.qty) || 0)
  const qtyTimer   = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pendingQty = useRef<number | null>(null)

  const prevItemIdRef = useRef(item.id)

  useEffect(() => {
    if (prevItemIdRef.current === item.id) return
    prevItemIdRef.current = item.id
    pendingQty.current = null
    if (qtyTimer.current) clearTimeout(qtyTimer.current)
    qtyTimer.current = null
    setLocalQty(Number(item.qty) || 0)
  }, [item.id, item.qty])

  useEffect(() => {
    const serverQty = Number(item.qty) || 0
    if (pendingQty.current !== null) {
      if (serverQty === pendingQty.current) { pendingQty.current = null; setLocalQty(serverQty) }
      return
    }
    if (!qtyTimer.current) setLocalQty(serverQty)
  }, [item.qty])

  useEffect(() => () => { if (qtyTimer.current) clearTimeout(qtyTimer.current) }, [])

  // Name: inline edit
  const [editing,  setEditing]  = useState(false)
  const [editName, setEditName] = useState(item.name)
  const nameRef = useRef<HTMLInputElement>(null)

  useEffect(() => { if (!editing) setEditName(item.name) }, [item.name, editing])
  useEffect(() => { if (renameTrigger > 0) startEdit() }, [renameTrigger]) // eslint-disable-line react-hooks/exhaustive-deps

  function startEdit() { if (readOnly) return; setEditing(true); setTimeout(() => nameRef.current?.focus(), 0) }
  function commitEdit() {
    const trimmed = editName.trim()
    if (trimmed && trimmed !== item.name) onUpdate(item.id, 'name', trimmed)
    else setEditName(item.name)
    setEditing(false)
  }
  function cancelEdit() { setEditName(item.name); setEditing(false) }

  const step      = stepForUnit(item.unit)
  const lineTotal = item.price * localQty

  function changeQtyByStep(delta: number) {
    if (readOnly) return
    window.haptic?.()
    const next = Math.max(0, +(Number(localQty) + delta).toFixed(2))
    setLocalQty(next)
    pendingQty.current = next
    if (qtyTimer.current) clearTimeout(qtyTimer.current)
    qtyTimer.current = setTimeout(() => { onUpdate(item.id, 'qty', next); qtyTimer.current = null }, 400)
  }

  const isMe = !!(meId && item.buyer_id === meId)

  return (
    <div className="px-3.5 py-2.5">
      {/* Row 1: name + assign chip */}
      <div className="flex items-center gap-2 mb-1.5">
        <div className="flex-1 min-w-0 flex items-center gap-1.5 flex-wrap">
          {editing ? (
            <input
              ref={nameRef}
              value={editName}
              onChange={e => setEditName(e.target.value)}
              onBlur={commitEdit}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); commitEdit() } if (e.key === 'Escape') cancelEdit() }}
              className="glass-input text-md font-extrabold rounded-sm flex-1"
              style={{ minWidth: 0, padding: '2px 8px', border: '1px solid var(--accent)', background: 'var(--surface-fire-8)', color: 'var(--text)' }}
            />
          ) : (
            <span
              className={`text-md font-extrabold leading-tight tracking-tight ${readOnly ? '' : 'cursor-text'}`}
              onClick={startEdit}
            >
              {item.name}
            </span>
          )}
          {!editing && <SourceBadge source={item.source} />}
        </div>

        <button
          type="button"
          onClick={() => { if (!readOnly) onBuyerTap(item.id) }}
          disabled={readOnly}
          className="inline-flex items-center gap-1 rounded-pill text-xs font-extrabold shrink-0 border"
          style={{
            padding: '3px 8px',
            background: isMe ? 'var(--surface-fire-15)' : 'transparent',
            borderColor: isMe ? 'var(--surface-fire-40)' : 'var(--gb)',
            color: isMe ? 'var(--accent)' : 'var(--muted)',
            fontFamily: 'inherit',
            cursor: readOnly ? 'default' : 'pointer',
            opacity: readOnly ? 0.7 : 1,
          }}
        >
          {isMe ? <>✓ Я</> : item.buyer_name ? <><IconPerson size={10} strokeWidth={2} /> {item.buyer_name}</> : '＋ Взять'}
        </button>
      </div>

      {/* Row 2: qty stepper + price + dots */}
      <div className="flex items-center gap-2">
        <Stepper
          label={<>{fmtQty(localQty, item.unit)}{' '}<span className="font-semibold text-xs" style={{ color: 'var(--muted)' }}>{item.unit}</span></>}
          onDec={() => changeQtyByStep(-step)}
          onInc={() => changeQtyByStep(step)}
          disabled={readOnly}
        />

        {hasBudget && (
          <div
            className="ml-auto text-sm font-black tabular-nums shrink-0"
            style={{ color: item.price > 0 ? 'var(--accent)' : 'var(--muted)' }}
          >
            {item.price > 0 ? fmt(lineTotal) : '—'}
          </div>
        )}

        {!readOnly && (
          <button
            type="button"
            onClick={() => onOpenActions(item.id)}
            className={`size-6 rounded-sm border-none bg-transparent cursor-pointer flex items-center justify-center shrink-0${hasBudget ? '' : ' ml-auto'}`}
            style={{ color: 'var(--muted)' }}
            title="Ещё"
          >
            <IconDots />
          </button>
        )}
      </div>
    </div>
  )
}
