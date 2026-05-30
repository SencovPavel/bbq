import type { ToastVariant } from '../stores/toastStore'

/** Акцентная точка слева — единственный цветной элемент тоста */
export const TOAST_VARIANT_ACCENT: Record<ToastVariant, string> = {
  default: 'var(--green)',
  error: 'var(--red)',
  info: 'var(--blue)',
  muted: 'var(--muted-2)',
}
