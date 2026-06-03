import { useState, useEffect } from 'react'
import { authLogin, authRegister, authDevLogin } from '@shared/api/auth'
import { useToastStore } from '@stores/toastStore'
import type { User } from '@shared/types'

export type AuthMode = 'login' | 'register'

/** Преобразует ответ бэкенда в User для sessionStore */
function toUser(raw: { id: string; name: string; email?: string; bio?: string | null; username?: string | null; is_admin?: boolean }): User {
  return {
    id:       raw.id,
    name:     raw.name,
    email:    raw.email,
    bio:      raw.bio ?? undefined,
    username: raw.username ?? null,
    is_admin: raw.is_admin ?? false,
  }
}

export function useAuthScreenVM(onDone: (user: User) => void) {
  const [mode,     setMode]     = useState<AuthMode>('login')
  const [name,     setName]     = useState('')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(false)
  const showToast = useToastStore(s => s.show)

  // Show error if redirected back from OAuth with ?auth_error=1
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('auth_error')) {
      showToast('Ошибка входа через соцсеть', 'error')
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [showToast])

  function switchMode(m: AuthMode) {
    setMode(m)
    setName(''); setEmail(''); setPassword('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const raw = mode === 'register'
        ? await authRegister(name.trim(), email.trim(), password)
        : await authLogin(email.trim(), password)
      onDone(toUser(raw))
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Ошибка', 'error')
    } finally {
      setLoading(false)
    }
  }

  async function handleDevLogin() {
    setLoading(true)
    try {
      const raw = await authDevLogin()
      if (raw) onDone(toUser(raw))
      else showToast('dev-login недоступен', 'error')
    } catch {
      showToast('Ошибка dev-login', 'error')
    } finally {
      setLoading(false)
    }
  }

  return {
    mode,
    name,  setName,
    email, setEmail,
    password, setPassword,
    loading,
    switchMode,
    handleSubmit,
    handleDevLogin,
  }
}
