import { useState } from 'react'
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
      </div>
    </div>
  )
}
