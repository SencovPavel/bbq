import { getTelegramInitData } from '../lib/tg'

import type { GroupSummary, AnalysisResult, FamilyMemberFull } from '../types'

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

// ── Family ────────────────────────────────────────────────────────────────────

export async function getFamilyMembers(): Promise<FamilyMemberFull[]> {
  const r = await authFetch('/family/members')
  if (!r.ok) return []
  return r.json()
}

export async function addFamilyMember(
  data: { name: string; label?: string },
): Promise<{ ok: true; member: FamilyMemberFull } | { ok: false; error: string }> {
  const r = await authFetch('/family/members', {
    method: 'POST',
    body: JSON.stringify(data),
  })
  const json = (await r.json()) as FamilyMemberFull & { error?: string }
  if (!r.ok) return { ok: false, error: json.error ?? 'Не удалось добавить' }
  return { ok: true, member: json }
}

export async function updateFamilyMember(id: string, data: { name?: string; label?: string | null }) {
  const r = await authFetch(`/family/members/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
  const json = (await r.json()) as { ok?: boolean; error?: string }
  if (!r.ok) return { error: json.error ?? 'Не удалось сохранить' }
  return json
}

export async function deleteFamilyMember(id: string) {
  const r = await authFetch(`/family/members/${id}`, { method: 'DELETE' })
  return r.json() as Promise<{ ok?: boolean; error?: string }>
}

export async function setFamilyMemberGroup(
  memberId: string,
  opts: { groupId: string; enabled: boolean; includeInCalc?: boolean; costPct?: number },
) {
  const r = await authFetch(`/family/members/${memberId}/groups`, {
    method: 'POST',
    body: JSON.stringify(opts),
  })
  return r.json() as Promise<{ ok?: boolean; error?: string }>
}

// ── Profile ───────────────────────────────────────────────────────────────────

export async function updateProfile(data: { bio?: string }) {
  const r = await authFetch('/auth/profile', {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
  if (!r.ok) throw new Error('Ошибка сохранения профиля')
  return r.json() as Promise<{ id: string; name: string; email: string; bio: string | null }>
}

// ── Agent ─────────────────────────────────────────────────────────────────────

export async function analyzeWithAgent(groupId: string) {
  const r = await authFetch('/agent/analyze', {
    method: 'POST',
    body: JSON.stringify({ groupId }),
  })
  return r.json() as Promise<AnalysisResult>
}
