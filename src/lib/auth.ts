/**
 * Web auth API — email + password, HttpOnly cookie sessions.
 * Все запросы идут на тот же origin (Vite proxy → backend).
 */

export interface WebUser {
  id:    string
  name:  string
  email: string
}

async function post(path: string, body: object): Promise<WebUser> {
  const r = await fetch(path, {
    method:      'POST',
    headers:     { 'Content-Type': 'application/json' },
    credentials: 'include',
    body:        JSON.stringify(body),
  })
  const data = await r.json()
  if (!r.ok) throw new Error(data.error ?? 'Ошибка запроса')
  return data as WebUser
}

export const authRegister = (name: string, email: string, password: string) =>
  post('/auth/register', { name, email, password })

export const authLogin = (email: string, password: string) =>
  post('/auth/login', { email, password })

export async function authMe(): Promise<WebUser | null> {
  try {
    const r = await fetch('/auth/me', { credentials: 'include' })
    if (!r.ok) return null
    return r.json()
  } catch {
    return null
  }
}

export async function authLogout(): Promise<void> {
  await fetch('/auth/logout', { method: 'POST', credentials: 'include' })
}
