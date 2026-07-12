import type { ReactNode } from 'react'

interface SegmentedOption {
  value: string
  label: ReactNode
}

interface SegmentedControlProps {
  options: SegmentedOption[]
  value: string
  onChange: (value: string) => void
  label?: string
  /** true (default) — равноширинные вкладки на всю ширину; false — чипы по контенту, с переносом */
  fullWidth?: boolean
}

export function SegmentedControl({ options, value, onChange, label, fullWidth = true }: SegmentedControlProps) {
  return (
    <div role="radiogroup" aria-label={label} className={fullWidth ? 'flex gap-[6px]' : 'flex flex-wrap gap-2'}>
      {options.map(opt => {
        const active = opt.value === value
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(opt.value)}
            className={
              fullWidth
                ? 'flex-1 py-[9px] rounded-[10px] text-[13px] font-bold cursor-pointer border transition-all'
                : 'px-3 py-1 rounded-pill text-[12px] font-bold cursor-pointer border transition-all'
            }
            style={{
              background: active ? (fullWidth ? 'var(--accent)' : 'var(--surface-fire-12)') : 'var(--surface-white-6)',
              borderColor: active ? 'var(--accent)' : 'var(--gb)',
              color: active ? (fullWidth ? 'var(--text-on-accent)' : 'var(--accent)') : 'var(--muted)',
              fontFamily: 'inherit',
            }}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
