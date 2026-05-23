import { useState, useEffect } from 'react'
import type { Item } from '../types'

interface PriceCellProps {
  item: Item
  onChange: (id: string, price: number) => void
}

export function PriceCell({ item, onChange }: PriceCellProps) {
  const [val, setVal]       = useState(item.price > 0 ? String(item.price) : '')
  const [focused, setFocused] = useState(false)

  useEffect(() => {
    if (!focused) setVal(item.price > 0 ? String(item.price) : '')
  }, [item.price, focused])

  return (
    <input
      type="number" min="0" step="1"
      value={val}
      placeholder="0"
      onChange={e => setVal(e.target.value)}
      onFocus={() => setFocused(true)}
      onBlur={e => {
        setFocused(false)
        onChange(item.id, parseFloat(e.target.value) || 0)
      }}
      className="text-right rounded-[8px] text-[12px] font-bold glass-input"
      style={{ width: 60, padding: '3px 8px' }}
    />
  )
}
