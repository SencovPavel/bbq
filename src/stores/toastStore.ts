import { create } from 'zustand'

export type ToastVariant = 'default' | 'error' | 'info' | 'muted'

interface ToastAction {
  label: string
  fn: () => void
}

interface ToastData {
  msg: string
  visible: boolean
  variant: ToastVariant
  action?: ToastAction
}

interface ToastStore {
  toast: ToastData
  show: (msg: string, variant?: ToastVariant, action?: ToastAction) => void
  hide: () => void
}

let timer: ReturnType<typeof setTimeout>

export const useToastStore = create<ToastStore>((set) => ({
  toast: { msg: '', visible: false, variant: 'default' },
  show: (msg, variant = 'default', action) => {
    clearTimeout(timer)
    set({ toast: { msg, visible: true, variant, action } })
    timer = setTimeout(
      () => set((s) => ({ toast: { ...s.toast, visible: false, action: undefined } })),
      action ? 4000 : 2200,
    )
  },
  hide: () => {
    clearTimeout(timer)
    set((s) => ({ toast: { ...s.toast, visible: false, action: undefined } }))
  },
}))
