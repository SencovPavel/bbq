import { TOAST_VARIANT_ACCENT } from '../lib/toast-variant'
import { useToastStore } from '../stores/toastStore'

export function Toast() {
  const toast = useToastStore((s) => s.toast)
  const hide = useToastStore((s) => s.hide)
  const accent = TOAST_VARIANT_ACCENT[toast.variant]

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed z-[300] left-1/2 max-w-[min(92vw,360px)] rounded-[var(--r-md)] text-[13px] font-semibold px-3.5 py-2.5 flex items-start gap-2.5 leading-snug"
      style={{
        top: 'max(12px, env(safe-area-inset-top, 0px))',
        transform: toast.visible
          ? 'translateX(-50%) translateY(0)'
          : 'translateX(-50%) translateY(-12px)',
        opacity: toast.visible ? 1 : 0,
        background: 'rgba(16, 14, 11, 0.92)',
        border: '1px solid var(--card-b)',
        color: 'var(--text)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.35)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        pointerEvents: toast.visible && toast.action ? 'auto' : 'none',
        transition: 'transform .25s ease, opacity .25s ease',
      }}
    >
      <span
        className="shrink-0 mt-[5px] rounded-full"
        style={{ width: 6, height: 6, background: accent }}
        aria-hidden
      />
      <span className="flex-1 min-w-0">{toast.msg}</span>
      {toast.action && (
        <button
          type="button"
          onClick={() => {
            toast.action!.fn()
            hide()
          }}
          className="shrink-0 rounded-[var(--r-pill)] text-[12px] font-bold px-2.5 py-0.5 cursor-pointer"
          style={{
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid var(--gb)',
            color: 'var(--text)',
            fontFamily: 'inherit',
          }}
        >
          {toast.action.label}
        </button>
      )}
    </div>
  )
}
