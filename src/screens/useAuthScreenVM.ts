import { useState, useEffect } from 'react'
import { authLogin, authRegister } from '@shared/api/auth'
import { useToastStore } from '@stores/toastStore'
import type { User } from '@shared/types'

export type AuthMode = 'login' | 'register'

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
      const user = mode === 'register'
        ? await authRegister(name.trim(), email.trim(), password)
        : await authLogin(email.trim(), password)
      onDone({ id: user.id, name: user.name })
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Ошибка', 'error')
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
  }
}
