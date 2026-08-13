import { useEffect, useRef, type RefObject } from 'react'

const FOCUSABLE = [
  'a[href]', 'button:not([disabled])', 'textarea:not([disabled])',
  'input:not([disabled])', 'select:not([disabled])', '[tabindex]:not([tabindex="-1"])',
].join(',')

/**
 * A11y для модалок/шторок: закрытие по Esc, автофокус на первый
 * интерактивный элемент, простой focus-trap внутри панели.
 *
 * Не является View-компонентом (это shared-хук), поэтому эффекты допустимы.
 */
export function useModalA11y(
  open: boolean,
  onClose: () => void,
  panelRef: RefObject<HTMLElement>,
): void {
  const onCloseRef = useRef(onClose)
  useEffect(() => { onCloseRef.current = onClose }, [onClose])

  useEffect(() => {
    if (!open) return
    const panel = panelRef.current
    if (!panel) return

    const prevFocused = document.activeElement as HTMLElement | null

    const focusables = () =>
      Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE))
        .filter(el => el.offsetParent !== null || el === document.activeElement)

    // Автофокус на первый интерактивный элемент (или саму панель)
    const first = focusables()[0]
    if (first) first.focus()
    else {
      panel.setAttribute('tabindex', '-1')
      panel.focus()
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onCloseRef.current()
        return
      }
      if (e.key !== 'Tab') return
      const els = focusables()
      if (els.length === 0) { e.preventDefault(); return }
      const firstEl = els[0]
      const lastEl  = els[els.length - 1]
      const active  = document.activeElement
      if (e.shiftKey && active === firstEl) {
        e.preventDefault()
        lastEl.focus()
      } else if (!e.shiftKey && active === lastEl) {
        e.preventDefault()
        firstEl.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown, true)
    return () => {
      document.removeEventListener('keydown', onKeyDown, true)
      prevFocused?.focus?.()
    }
  }, [open, panelRef])
}
