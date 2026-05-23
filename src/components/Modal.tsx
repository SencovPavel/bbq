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
      style={{ background: 'rgba(0,0,0,.7)', backdropFilter: 'blur(6px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="w-full max-w-[500px] rounded-t-[28px] overflow-y-auto slide-up"
        style={{
          background: '#18140f',
          border: '1px solid var(--gb)',
          borderBottom: 'none',
          padding: '8px 20px calc(24px + env(safe-area-inset-bottom,0))',
          maxHeight: '85vh',
        }}>
        {/* drag handle */}
        <div className="flex justify-center mb-4 pt-1">
          <div className="rounded-full" style={{ width: 36, height: 4, background: 'var(--gb)' }} />
        </div>
        {title && (
          <div className="text-[16px] font-extrabold text-center mb-5">{title}</div>
        )}
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
        style={{ background: 'rgba(255,240,200,.07)', border: '1px solid var(--gb)', color: 'var(--muted)', fontFamily: 'inherit' }}>
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
        style={{ background: 'rgba(255,240,200,.06)', border: '1px solid var(--gb)', color: 'var(--text)' }}>
        {children}
      </select>
    </div>
  )
}
