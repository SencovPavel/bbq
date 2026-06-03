export interface User {
  id: string
  name: string
  email?: string
  /** Часть email до "@", напр. "anya_k" из "anya_k@mail.ru" */
  username?: string | null
  /** true если пользователь является администратором хотя бы в одной группе */
  is_admin?: boolean
  bio?: string | null
}

export interface Group {
  id: string
  name: string
  invite_code: string
}

export interface Category {
  id: string
  title: string
  icon: string
}

export interface Item {
  id: string
  cat_id: string
  event_id: string | null
  name: string
  qty: number
  unit: string
  price: number
  enabled: boolean
  bought: boolean
  buyer_id: string | null
  buyer_name: string | null
  source: 'chat' | 'agent' | 'manual'
  chat_hint?: string
}

export interface PicnicEvent {
  id: string
  group_id: string
  name: string
  event_date: string | null   // ISO date "YYYY-MM-DD"
  event_time: string | null   // "HH:MM:SS"
  location: string | null
  description: string | null
  status: 'active' | 'completed'
  created_at: string
}

export interface Member {
  user_id: string
  name: string
  is_admin: boolean
}

export interface ActivityEntry {
  id: number
  group_id: string
  event_id: string | null
  type: string
  actor_name: string | null
  data: Record<string, unknown>
  created_at: string
}

export interface EventRsvp {
  event_id:  string
  user_id:   string
  attending: boolean
}

/** Глобальный (не группо-специфичный) член семьи — часть serverState с настройками группы. */
export interface FamilyMember {
  id:              string
  owner_id:        string
  name:            string
  label:           string | null
  /** Настройки для конкретной группы (null — не добавлен в эту группу). */
  include_in_calc: boolean | null
  cost_pct:        number | null
}

/** RSVP члена семьи (без аккаунта) на событие. */
export interface FamilyRsvp {
  family_member_id: string
  event_id:         string
  attending:        boolean
}

/** Полный член семьи с настройками по всем группам — только в HTTP /family/members. */
export interface FamilyMemberGroup {
  group_id:        string
  group_name:      string
  include_in_calc: boolean
  cost_pct:        number
}

export interface FamilyMemberFull extends FamilyMember {
  groups: FamilyMemberGroup[]
}

export interface ServerState {
  group: Group
  categories: Category[]
  items: Item[]
  members: Member[]
  events: PicnicEvent[]
  activity?: ActivityEntry[]
  rsvp?: EventRsvp[]
  familyMembers?: FamilyMember[]
  familyRsvp?: FamilyRsvp[]
}

export interface GroupSummary {
  id: string
  name: string
  member_count: number
  item_count: number
}

export interface AnalysisResult {
  summary: string
  missing?: Array<{ name: string; hint?: string }>
  changed?: Array<{ name: string; chat_qty: number | string; list_qty: number | string }>
}

export type Screen = 'loading' | 'auth' | 'onboarding' | 'groups' | 'app' | 'family' | 'profile'
export type Tab    = 'events' | 'list' | 'summary' | 'my' | 'members'

export type ToastVariant = 'default' | 'error' | 'info' | 'muted'
