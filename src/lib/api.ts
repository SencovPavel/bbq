import { getTelegramInitData } from './tg'

import type { GroupSummary, AnalysisResult } from '../types'

const base = ''

const authHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  const initData = getTelegramInitData()
  if (initData) headers['X-Telegram-Init-Data'] = initData
  return headers
}

const authFetch = (path: string, init: RequestInit = {}) =>
  fetch(`${base}${path}`, {
    ...init,
    credentials: 'include',
    headers: { ...authHeaders(), ...(init.headers as Record<string, string> | undefined) },
  })

export async function createGroup(opts: { name: string }) {
  const r = await authFetch('/groups', {
    method: 'POST',
    body: JSON.stringify({ name: opts.name }),
  })
  return r.json() as Promise<{ id?: string; inviteCode?: string; error?: string }>
}

export async function joinGroup(opts: { inviteCode: string }) {
  const r = await authFetch('/groups/join', {
    method: 'POST',
    body: JSON.stringify({ inviteCode: opts.inviteCode }),
  })
  return r.json() as Promise<{ id?: string; name?: string; error?: string }>
}

export async function joinGroupById(opts: { groupId: string }) {
  const r = await authFetch('/groups/join-by-id', {
    method: 'POST',
    body: JSON.stringify({ groupId: opts.groupId }),
  })
  return r.json() as Promise<{ id?: string; name?: string; error?: string }>
}

export async function getUserGroups(userId: string) {
  const r = await authFetch(`/users/${userId}/groups`)
  if (!r.ok) return []
  return r.json() as Promise<GroupSummary[]>
}

export async function analyzeWithAgent(groupId: string) {
  const r = await authFetch('/agent/analyze', {
    method: 'POST',
    body: JSON.stringify({ groupId }),
  })
  return r.json() as Promise<AnalysisResult>
}
