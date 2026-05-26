import type { ReactNode } from 'react'

interface WebPageLayoutProps {
  children: ReactNode
  /** Широкая сетка: слева промо, справа форма (группы, авторизация). */
  wide?: boolean
}

/**
 * Оболочка для экранов вне группы: cloud-карточка на десктопе, полноэкран на мобиле.
 */
export function WebPageLayout({ children, wide = false }: WebPageLayoutProps) {
  return (
    <div className={`web-page${wide ? ' web-page--wide' : ''}`}>
      <div className="web-page__promo hidden lg:flex">
        <div className="web-page__promo-inner">
          <div className="web-page__logo">🔥</div>
          <h1 className="web-page__headline">Котёл</h1>
          <p className="web-page__tagline">
            Планируйте закупки вместе: списки, участники, итоги и напоминания — в одном месте.
          </p>
          <ul className="web-page__features">
            <li>Общий список в реальном времени</li>
            <li>События и категории</li>
            <li>Кто что покупает</li>
          </ul>
        </div>
      </div>
      <div className="web-page__body">
        <div className="cloud-panel web-page__card">{children}</div>
      </div>
    </div>
  )
}
