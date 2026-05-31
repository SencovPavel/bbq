/** Member domain — pure functions. */
import type { Member } from '@shared/types'

/** Initials shown in the avatar when no photo is available. */
export const memberInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return name.slice(0, 2).toUpperCase()
}

/** Display name: prefer first_name + last_name over username. */
export const memberDisplayName = (m: Pick<Member, 'name'>): string => m.name
