export const GROUP_TINTS = ['orange', 'violet', 'forest', 'sky', 'coral'] as const

export type GroupTint = (typeof GROUP_TINTS)[number]

export const groupTint = (id: string): GroupTint => {
  const h = [...id].reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return GROUP_TINTS[h % GROUP_TINTS.length] ?? 'orange'
}

interface TintStyle {
  from: string
  to: string
  border: string
}

export const TINT_STYLES: Record<GroupTint, TintStyle> = {
  orange: {
    from: 'rgba(249,115,22,.28)',
    to: 'rgba(251,191,36,.12)',
    border: 'rgba(249,115,22,.3)',
  },
  violet: {
    from: 'rgba(167,139,250,.22)',
    to: 'rgba(99,102,241,.08)',
    border: 'rgba(167,139,250,.28)',
  },
  forest: {
    from: 'rgba(74,222,128,.22)',
    to: 'rgba(34,197,94,.08)',
    border: 'rgba(74,222,128,.28)',
  },
  sky: {
    from: 'rgba(125,211,252,.22)',
    to: 'rgba(59,130,246,.08)',
    border: 'rgba(125,211,252,.28)',
  },
  coral: {
    from: 'rgba(251,113,133,.22)',
    to: 'rgba(248,113,113,.08)',
    border: 'rgba(251,113,133,.28)',
  },
}
