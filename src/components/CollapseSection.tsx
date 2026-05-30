import { useState, type ReactNode } from 'react'
import { IconChevronRight } from './Icon'

interface Props {
  title: string
  count?: number        // янтарная плашка-счётчик рядом с заголовком
  defaultOpen?: boolean
  action?: ReactNode    // опциональный правый элемент (кнопка «Изменить» и т.п.)
  children: ReactNode
}

/**
 * Сворачиваемая секция с кликабельным заголовком.
 * action рендерится отдельно от кнопки-тоггла, чтобы не создавать
 * невалидную вложенность <button> внутри <button>.
 */
export function CollapseSection({ title, count, defaultOpen = true, action, children }: Props) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div
      className="rounded-md mb-3 overflow-hidden"
      style={{
        background: 'rgba(255,240,200,0.04)',
        border: '1px solid var(--gb)',
        backdropFilter: 'blur(20px)',
      }}
    >
      {/* Заголовок: тоггл + опциональный action */}
      <div className="flex items-center">
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          className="flex-1 flex items-center gap-2 px-3.5 py-2.5 border-none bg-transparent cursor-pointer text-left min-w-0"
          style={{ fontFamily: 'inherit' }}
        >
          <span
            className="inline-flex shrink-0 transition-transform duration-200"
            style={{
              color: 'var(--muted)',
              transform: open ? 'rotate(90deg)' : 'rotate(0deg)',
            }}
          >
            <IconChevronRight size={13} strokeWidth={2.6} />
          </span>
          <span
            className="text-[10.5px] font-extrabold uppercase tracking-wider"
            style={{ color: 'var(--muted)' }}
          >
            {title}
          </span>
          {count != null && (
            <span
              className="text-[10.5px] font-extrabold rounded-pill px-1.5 py-px"
              style={{ color: 'var(--accent-2)', background: 'rgba(251,191,36,.1)' }}
            >
              {count}
            </span>
          )}
        </button>

        {/* Action вне тоггл-кнопки — нет вложенности кнопок */}
        {action && <div className="pr-3.5 shrink-0">{action}</div>}
      </div>

      {open && (
        <>
          <div className="h-px" style={{ background: 'var(--gb)' }} />
          {children}
        </>
      )}
    </div>
  )
}
