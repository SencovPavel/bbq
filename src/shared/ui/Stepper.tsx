import type { ReactNode } from 'react'

interface StepperProps {
  label: ReactNode
  onDec: () => void
  onInc: () => void
  disabled?: boolean
}

export function Stepper({ label, onDec, onInc, disabled = false }: StepperProps) {
  const btnStyle = {
    color: 'var(--text)',
    fontFamily: 'inherit',
    cursor: disabled ? 'default' : 'pointer',
    opacity: disabled ? 0.5 : 1,
  } as const

  return (
    <div
      className="flex items-center shrink-0 rounded-sm p-px"
      style={{ background: 'var(--surface-input)', border: '1px solid var(--gbs)' }}
    >
      <button
        type="button"
        onClick={onDec}
        disabled={disabled}
        className="size-[22px] border-none bg-transparent text-sm flex items-center justify-center"
        style={btnStyle}
      >−</button>
      <span className="text-sm font-extrabold px-2 min-w-[50px] text-center tabular-nums">{label}</span>
      <button
        type="button"
        onClick={onInc}
        disabled={disabled}
        className="size-[22px] border-none bg-transparent text-sm flex items-center justify-center"
        style={btnStyle}
      >+</button>
    </div>
  )
}
