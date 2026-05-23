import { useEffect, type ReactNode, type InputHTMLAttributes, type SelectHTMLAttributes } from 'react'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
}

export function Modal({ open, onClose, title, children }: ModalProps) {
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null
  return (
    <div className="fixed inset-0 z-[200] flex items-end justify-center"
      style={{ background: 'rgba(0,0,0,.65)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="w-full max-w-[500px] rounded-t-[24px] overflow-y-auto"
        style={{ background: '#1a1d2e', border: '1px solid var(--gb)',
          padding: '20px 20px calc(20px + env(safe-area-inset-bottom,0))',
          maxHeight: '80vh' }}>
        {title && <div className="text-base font-extrabold text-center mb-4">{title}</div>}
        {children}
      </div>
    </div>
  )
}

interface ModalButtonsProps {
  onCancel: () => void
  onConfirm: () => void
  cancelText?: string
  confirmText?: string
  danger?: boolean
}

export function ModalButtons({ onCancel, onConfirm, cancelText = 'Отмена', confirmText = 'Готово', danger }: ModalButtonsProps) {
  return (
    <div className="grid grid-cols-2 gap-[10px] mt-4">
      <button onClick={onCancel}
        className="p-[13px] rounded-xl border-none cursor-pointer text-sm font-extrabold"
        style={{ background: 'rgba(255,255,255,.08)', color: 'var(--muted)', fontFamily: 'inherit' }}>
        {cancelText}
      </button>
      <button onClick={onConfirm}
        className="p-[13px] rounded-xl border-none cursor-pointer text-sm font-extrabold"
        style={{ background: danger ? 'var(--red)' : 'var(--accent)', color: '#fff', fontFamily: 'inherit' }}>
        {confirmText}
      </button>
    </div>
  )
}

interface GlassInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

export function GlassInput({ label, ...props }: GlassInputProps) {
  return (
    <div className="mb-3">
      {label && (
        <label className="block text-[11px] font-extrabold mb-[6px] uppercase tracking-wider"
          style={{ color: 'var(--muted)' }}>
          {label}
        </label>
      )}
      <input className="glass-input w-full px-[14px] py-3 rounded-xl text-sm font-semibold" {...props} />
    </div>
  )
}

interface GlassSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  children: ReactNode
}

export function GlassSelect({ label, children, ...props }: GlassSelectProps) {
  return (
    <div className="mb-3">
      {label && (
        <label className="block text-[11px] font-extrabold mb-[6px] uppercase tracking-wider"
          style={{ color: 'var(--muted)' }}>
          {label}
        </label>
      )}
      <select className="glass-input w-full px-[14px] py-3 rounded-xl text-sm font-semibold" {...props}
        style={{ background: 'rgba(255,255,255,.08)', border: '1px solid var(--gb)', color: 'var(--text)' }}>
        {children}
      </select>
    </div>
  )
}
