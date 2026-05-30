export interface User {
  id: string
  name: string
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

export interface ServerState {
  group: Group
  categories: Category[]
  items: Item[]
  members: Member[]
  events: PicnicEvent[]
  activity: ActivityEntry[]
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

export type Screen = 'loading' | 'auth' | 'onboarding' | 'groups' | 'app'
export type Tab    = 'events' | 'list' | 'summary' | 'my' | 'members'
