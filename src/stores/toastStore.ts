import { create } from 'zustand'

interface ToastAction {
  label: string
  fn: () => void
}

interface ToastData {
  msg: string
  visible: boolean
  color: string
  action?: ToastAction
}

interface ToastStore {
  toast: ToastData
  show: (msg: string, color?: string, action?: ToastAction) => void
  hide: () => void
}

let timer: ReturnType<typeof setTimeout>

export const useToastStore = create<ToastStore>((set) => ({
  toast: { msg: '', visible: false, color: '' },
  show: (msg, color = 'var(--green)', action) => {
    clearTimeout(timer)
    set({ toast: { msg, visible: true, color, action } })
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
