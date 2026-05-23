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

export interface Member {
  user_id: string
  name: string
}

export interface ServerState {
  group: Group
  categories: Category[]
  items: Item[]
  members: Member[]
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

export type Screen = 'loading' | 'onboarding' | 'groups' | 'app'
export type Tab    = 'list' | 'summary' | 'my' | 'members'
