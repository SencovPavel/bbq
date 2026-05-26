/**
 * Минимальный набор SVG-иконок.
 * Все иконки 1:1 с Lucide, strokeWidth по умолчанию 1.8.
 */

interface IconProps {
  size?: number
  color?: string
  strokeWidth?: number
  className?: string
}

const base = (
  size: number,
  sw: number,
  children: React.ReactNode,
  className?: string,
) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={sw}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {children}
  </svg>
)

const icon = (
  { size = 16, strokeWidth = 1.8, className }: IconProps,
  children: React.ReactNode,
) => base(size, strokeWidth, children, className)

export function IconChevronLeft(props: IconProps) {
  return icon(props, <path d="M15 18l-6-6 6-6" />)
}

export function IconChevronDown(props: IconProps) {
  return icon(props, <path d="M6 9l6 6 6-6" />)
}

export function IconQrScan({ size = 15, strokeWidth = 2 }: IconProps) {
  return icon(
    { size, strokeWidth },
  <>
    <rect x="3" y="3" width="6" height="6" rx="1" />
    <rect x="15" y="3" width="6" height="6" rx="1" />
    <rect x="3" y="15" width="6" height="6" rx="1" />
    <path d="M15 15v3M15 21h3M18 15v6M21 15v3M21 21h-3" />
  </>,
  )
}

export function IconDots({ size = 14, strokeWidth = 1.8, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <circle cx="5" cy="12" r="1.6" />
      <circle cx="12" cy="12" r="1.6" />
      <circle cx="19" cy="12" r="1.6" />
    </svg>
  )
}

export function IconTrash({ size = 16, strokeWidth = 1.8 }: IconProps) {
  return base(size, strokeWidth,
    <>
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4h6v2" />
    </>
  )
}

export function IconX({ size = 16, strokeWidth = 2 }: IconProps) {
  return base(size, strokeWidth,
    <>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </>
  )
}

export function IconPencil({ size = 14, strokeWidth = 1.8 }: IconProps) {
  return base(size, strokeWidth,
    <>
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </>
  )
}

export function IconClipboard({ size = 14, strokeWidth = 1.8 }: IconProps) {
  return base(size, strokeWidth,
    <>
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
    </>
  )
}

export function IconShare({ size = 16, strokeWidth = 1.8 }: IconProps) {
  return base(size, strokeWidth,
    <>
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
      <polyline points="16 6 12 2 8 6" />
      <line x1="12" y1="2" x2="12" y2="15" />
    </>
  )
}

export function IconCalendar({ size = 40, strokeWidth = 1.5 }: IconProps) {
  return base(size, strokeWidth,
    <>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8"  y1="2" x2="8"  y2="6" />
      <line x1="3"  y1="10" x2="21" y2="10" />
    </>
  )
}

export function IconCart({ size = 40, strokeWidth = 1.5 }: IconProps) {
  return base(size, strokeWidth,
    <>
      <circle cx="9"  cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </>
  )
}

export function IconPerson({ size = 12, strokeWidth = 1.8 }: IconProps) {
  return base(size, strokeWidth,
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </>
  )
}

export function IconCheck({ size = 12, strokeWidth = 2.2 }: IconProps) {
  return base(size, strokeWidth,
    <polyline points="20 6 9 17 4 12" />
  )
}

export function IconMapPin({ size = 12, strokeWidth = 1.8 }: IconProps) {
  return base(size, strokeWidth,
    <>
      <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 1 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </>
  )
}

export function IconAlertCircle({ size = 14, strokeWidth = 1.8 }: IconProps) {
  return base(size, strokeWidth,
    <>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </>
  )
}

export function IconAlertTriangle({ size = 14, strokeWidth = 1.8 }: IconProps) {
  return base(size, strokeWidth,
    <>
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </>
  )
}

export function IconCheckCircle({ size = 14, strokeWidth = 1.8 }: IconProps) {
  return base(size, strokeWidth,
    <>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </>
  )
}

export function IconFlame({ size = 24, strokeWidth = 1.6 }: IconProps) {
  return base(size, strokeWidth,
    <path d="M12 2C8 8 6 11 6 14a6 6 0 0 0 12 0c0-3-2-6-6-12zM8.5 17c.5-2 2-3.5 3.5-4-.5 2 .5 3.5 2 4a4 4 0 0 1-5.5 0z" />
  )
}

export function IconUsers({ size = 40, strokeWidth = 1.5 }: IconProps) {
  return base(size, strokeWidth,
    <>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </>
  )
}

export function IconReceipt({ size = 40, strokeWidth = 1.5 }: IconProps) {
  return base(size, strokeWidth,
    <>
      <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z" />
      <path d="M16 8H8" />
      <path d="M16 12H8" />
      <path d="M12 16H8" />
    </>
  )
}

export function IconRobot({ size = 14, strokeWidth = 1.8 }: IconProps) {
  return base(size, strokeWidth,
    <>
      <rect x="3" y="8" width="18" height="12" rx="2" />
      <path d="M12 2v6" />
      <circle cx="12" cy="2" r="1" />
      <circle cx="9"  cy="14" r="1.5" />
      <circle cx="15" cy="14" r="1.5" />
      <path d="M9 18h6" />
    </>
  )
}

export function IconCrown({ size = 14, strokeWidth = 1.8 }: IconProps) {
  return base(size, strokeWidth,
    <>
      <path d="M2 19h20" />
      <path d="M4 19 2 8l5 4 5-7 5 7 5-4-2 11" />
    </>
  )
}

export function IconLogOut({ size = 14, strokeWidth = 1.8 }: IconProps) {
  return base(size, strokeWidth,
    <>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </>
  )
}

export function IconShield({ size = 14, strokeWidth = 1.8 }: IconProps) {
  return base(size, strokeWidth,
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  )
}
