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
    <div className="w-full">
      <div className="lg:hidden" style={{ fontSize: 44, marginBottom: 8 }}>🔥</div>
      <div className="text-[26px] lg:text-[22px] font-black mb-1" style={{ letterSpacing: '-.02em' }}>
        {mode === 'login' ? 'Вход' : 'Регистрация'}
      </div>
      <div className="text-[13px] mb-6" style={{ color: 'var(--muted)' }}>
        Список покупок для компании
      </div>

      {/* Mode switch */}
      <div style={{
        display: 'flex',
        width: '100%',
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
      <div className="lg:bg-transparent lg:border-none lg:p-0" style={{
        width: '100%',
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
            {/* Yandex icon */}
            <svg width="22" height="22" viewBox="0 0 26 26" fill="none" style={{ flexShrink: 0 }}>
              <path fill="#F8604A" d="M26 13c0-7.18-5.82-13-13-13S0 5.82 0 13s5.82 13 13 13 13-5.82 13-13Z"/>
              <path fill="#fff" d="M17.55 20.822h-2.622V7.28h-1.321c-2.254 0-3.38 1.127-3.38 2.817 0 1.885.758 2.816 2.448 3.943l1.322.932-3.749 5.828H7.237l3.575-5.265c-2.059-1.495-3.185-2.817-3.185-5.265 0-3.012 2.058-5.07 6.023-5.07h3.9v15.622Z"/>
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
            {/* Apple icon — self-contained SVG like Yandex */}
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
              <circle cx="12" cy="12" r="12" fill="#1a1a1a" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5"/>
              <g transform="translate(3.6, 3.6) scale(0.7)">
                <path fill="white" d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98l-.09.06c-.22.15-2.22 1.3-2.2 3.88.03 3.07 2.69 4.1 2.72 4.11-.03.07-.42 1.44-1.38 2.59M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </g>
            </svg>
            Войти с Apple
          </button>
        </div>
      </div>
    </div>
  )
}
