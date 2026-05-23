import { create } from 'zustand'

interface ToastData {
  msg: string
  visible: boolean
  color: string
}

interface ToastStore {
  toast: ToastData
  show: (msg: string, color?: string) => void
}

let timer: ReturnType<typeof setTimeout>

export const useToastStore = create<ToastStore>((set) => ({
  toast: { msg: '', visible: false, color: '' },
  show: (msg, color = 'var(--green)') => {
    clearTimeout(timer)
    set({ toast: { msg, visible: true, color } })
    timer = setTimeout(
      () => set((s) => ({ toast: { ...s.toast, visible: false } })),
      2200,
    )
  },
}))
