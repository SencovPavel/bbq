import type { GroupSummary, AnalysisResult } from '../types'

const base = ''

export async function createGroup(opts: { name: string; userId: string; userName: string }) {
  const r = await fetch(`${base}/groups`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(opts),
  })
  return r.json() as Promise<{ id?: string; error?: string }>
}

export async function joinGroup(opts: { inviteCode: string; userId: string; userName: string }) {
  const r = await fetch(`${base}/groups/join`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(opts),
  })
  return r.json() as Promise<{ id?: string; error?: string }>
}

export async function joinGroupById(opts: { groupId: string; userId: string; userName: string }) {
  const r = await fetch(`${base}/groups/join-by-id`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(opts),
  })
  return r.json() as Promise<{ id?: string; error?: string }>
}

export async function getUserGroups(userId: string) {
  const r = await fetch(`${base}/users/${userId}/groups`)
  return r.json() as Promise<GroupSummary[]>
}

export async function analyzeWithAgent(groupId: string) {
  const r = await fetch(`${base}/agent/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ groupId }),
  })
  return r.json() as Promise<AnalysisResult>
}
