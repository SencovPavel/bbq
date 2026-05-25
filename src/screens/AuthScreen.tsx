import { useState, useEffect } from 'react'
import { authLogin, authRegister } from '../lib/auth'
import { useToastStore } from '../stores/toastStore'
import type { User } from '../types'

interface AuthScreenProps {
  onDone: (user: User) => void
}

type Mode = 'login' | 'register'

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '11px 14px',
  borderRadius: 10,
  border: '1px solid var(--gb)',
  background: 'rgba(255,255,255,.06)',
  color: 'var(--text)',
  fontSize: 14,
  fontFamily: 'inherit',
  outline: 'none',
  boxSizing: 'border-box',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 11,
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '.06em',
  marginBottom: 6,
  color: 'var(--muted)',
}

export function AuthScreen({ onDone }: AuthScreenProps) {
  const [mode,     setMode]     = useState<Mode>('login')
  const [name,     setName]     = useState('')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(false)
  const showToast = useToastStore(s => s.show)

  // Show error if redirected back from OAuth with error
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('auth_error')) {
      showToast('Ошибка входа через соцсеть', 'var(--red)')
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [showToast])

  function switchMode(m: Mode) {
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
      showToast(err instanceof Error ? err.message : 'Ошибка', 'var(--red)')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5">
      {/* Logo */}
      <div style={{ fontSize: 44, marginBottom: 8 }}>🔥</div>
      <div style={{ fontSize: 26, fontWeight: 900, letterSpacing: '-.02em', marginBottom: 4 }}>Пикник</div>
      <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 36 }}>
        Список покупок для компании
      </div>

      {/* Mode switch */}
      <div style={{
        display: 'flex',
        width: '100%',
        maxWidth: 380,
        padding: 4,
        borderRadius: 14,
        background: 'var(--g)',
        border: '1px solid var(--gb)',
        marginBottom: 16,
      }}>
        {(['login', 'register'] as Mode[]).map(m => (
          <button key={m} onClick={() => switchMode(m)}
            style={{
              flex: 1,
              padding: '10px 0',
              borderRadius: 11,
              border: 'none',
              fontSize: 13,
              fontWeight: 700,
              fontFamily: 'inherit',
              cursor: 'pointer',
              transition: 'all .18s',
              background: mode === m
                ? 'linear-gradient(90deg,var(--accent),var(--accent2))'
                : 'transparent',
              color: mode === m ? '#fff' : 'var(--muted)',
            }}>
            {m === 'login' ? 'Войти' : 'Регистрация'}
          </button>
        ))}
      </div>

      {/* Form card */}
      <div style={{
        width: '100%',
        maxWidth: 380,
        borderRadius: 20,
        background: 'var(--g)',
        border: '1px solid var(--gb)',
        backdropFilter: 'blur(20px)',
        padding: '20px 20px 24px',
      }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {mode === 'register' && (
            <div>
              <label style={labelStyle}>Имя</label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Как тебя зовут?"
                autoComplete="name"
                required
                style={inputStyle}
              />
            </div>
          )}

          <div>
            <label style={labelStyle}>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete={mode === 'login' ? 'email' : 'new-email'}
              required
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Пароль</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder={mode === 'register' ? 'Минимум 6 символов' : '••••••••'}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              required
              minLength={mode === 'register' ? 6 : undefined}
              style={inputStyle}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: 4,
              width: '100%',
              padding: '13px 0',
              borderRadius: 12,
              border: 'none',
              fontSize: 14,
              fontWeight: 800,
              fontFamily: 'inherit',
              cursor: loading ? 'default' : 'pointer',
              background: 'linear-gradient(90deg,var(--accent),var(--accent2))',
              color: '#fff',
              opacity: loading ? .65 : 1,
              transition: 'opacity .15s',
            }}>
            {loading
              ? 'Загрузка...'
              : mode === 'login' ? 'Войти' : 'Создать аккаунт'}
          </button>
        </form>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '16px 0 14px' }}>
          <div style={{ flex: 1, height: 1, background: 'var(--gb)' }} />
          <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600 }}>или</span>
          <div style={{ flex: 1, height: 1, background: 'var(--gb)' }} />
        </div>

        {/* OAuth buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button
            onClick={() => { window.location.href = '/auth/yandex' }}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              width: '100%', padding: '12px 0',
              borderRadius: 12, border: '1px solid var(--gb)',
              background: 'rgba(255,255,255,.05)',
              color: 'var(--text)', fontSize: 14, fontWeight: 700,
              fontFamily: 'inherit', cursor: 'pointer',
            }}>
            {/* Yandex Y logo */}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="12" fill="#FC3F1D"/>
              <path d="M13.32 18H11.2V8.28H10.04C8.36 8.28 7.48 9.08 7.48 10.4C7.48 11.88 8.12 12.6 9.44 13.48L10.68 14.28L7.4 18H5.16L8.12 14.6C6.48 13.52 5.56 12.36 5.56 10.48C5.56 8.12 7.24 6.56 10.04 6.56H13.32V18Z" fill="white"/>
            </svg>
            Войти через Яндекс
          </button>

          <button
            onClick={() => { window.location.href = '/auth/apple' }}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              width: '100%', padding: '12px 0',
              borderRadius: 12, border: '1px solid var(--gb)',
              background: 'rgba(255,255,255,.05)',
              color: 'var(--text)', fontSize: 14, fontWeight: 700,
              fontFamily: 'inherit', cursor: 'pointer',
            }}>
            {/* Apple logo */}
            <svg width="16" height="18" viewBox="0 0 814 1000" fill="currentColor">
              <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105.8-57.8-155.5-127.4C46 376.1 1 319.9 1 259.1c0-99.7 67-152.1 132.2-152.1 66 0 107.3 44.8 158.3 44.8s91.5-42.4 163.4-42.4c25.4 0 126.1 2.3 193.3 95.3zm-166-185.5c31.1-37 53.1-88.1 53.1-139.1 0-7.1-.6-14.3-1.9-20.1-50.6 1.9-110.8 33.7-147.1 75.8-28.5 32.4-55.1 83.6-55.1 135.5 0 7.8 1.3 15.6 1.9 18.1 3.2.6 8.4 1.3 13.6 1.3 45.4 0 102.5-30.4 135.5-71.5z"/>
            </svg>
            Войти с Apple
          </button>
        </div>
      </div>
    </div>
  )
}
