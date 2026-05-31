import { TOAST_VARIANT_ACCENT } from '../lib/toast-variant'
import { useToastStore } from '../../stores/toastStore'

import type { CSSProperties } from 'react'

export function Toast() {
  const toast = useToastStore((s) => s.toast)
  const hide = useToastStore((s) => s.hide)
  const accent = TOAST_VARIANT_ACCENT[toast.variant]

  const dotStyle = { '--overlay-dot-color': accent } as CSSProperties

  const className = [
    'floating-overlay',
    'floating-overlay--toast',
    !toast.visible && 'floating-overlay--hidden',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div role="status" aria-live="polite" className={className}>
      <span className="floating-overlay__dot" style={dotStyle} aria-hidden />
      <span className="floating-overlay__message flex-1">{toast.msg}</span>
      {toast.action && (
        <button
          type="button"
          className="floating-overlay__action"
          onClick={() => {
            toast.action!.fn()
            hide()
          }}
        >
          {toast.action.label}
        </button>
      )}
    </div>
  )
}
