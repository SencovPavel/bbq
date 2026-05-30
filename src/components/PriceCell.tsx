import { useState, useEffect } from 'react'

import type { Item } from '../types'

interface PriceCellProps {
  item: Item
  readOnly?: boolean
  onChange: (id: string, price: number) => void
}

const formatPriceValue = (price: number): string => {
  const n = Number(price)
  if (!n || Number.isNaN(n)) return ''
  return String(n)
}

export function PriceCell({ item, readOnly = false, onChange }: PriceCellProps) {
  const [val, setVal] = useState(() => formatPriceValue(item.price))
  const [focused, setFocused] = useState(false)

  useEffect(() => {
    if (!focused) setVal(formatPriceValue(item.price))
  }, [item.price, focused])

  if (readOnly) {
    return (
      <span
        className="text-right rounded-[8px] text-[12px] font-bold tabular-nums inline-block"
        style={{ width: 76, minWidth: 76, padding: '4px 10px', color: 'var(--muted)' }}
      >
        {item.price > 0 ? formatPriceValue(item.price) : '0'}
      </span>
    )
  }

  return (
    <input
      type="number"
      min="0"
      step="1"
      inputMode="decimal"
      value={val}
      placeholder="0"
      onChange={(e) => setVal(e.target.value)}
      onFocus={() => setFocused(true)}
      onBlur={(e) => {
        setFocused(false)
        onChange(item.id, parseFloat(e.target.value.replace(',', '.')) || 0)
      }}
      className="price-input text-right rounded-[8px] text-[12px] font-bold glass-input"
      style={{
        width: 76,
        minWidth: 76,
        padding: '4px 10px',
        fontVariantNumeric: 'tabular-nums',
      }}
    />
  )
}
