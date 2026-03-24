import { useState, FormEvent } from 'react'
import type { AuthError } from '@supabase/supabase-js'

interface Props {
  onSignIn: (email: string, password: string) => Promise<{ error: AuthError | null }>
  onSignUp: (
    email: string,
    password: string,
  ) => Promise<{ error: AuthError | null; needsConfirmation: boolean }>
  onToggleTheme: () => void
  theme: 'light' | 'dark'
}

export default function AuthPage({ onSignIn, onSignUp, onToggleTheme, theme }: Props) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setInfo(null)
    setLoading(true)

    if (mode === 'signin') {
      const { error } = await onSignIn(email, password)
      if (error) setError(error.message)
    } else {
      const { error, needsConfirmation } = await onSignUp(email, password)
      if (error) {
        setError(error.message)
      } else if (needsConfirmation) {
        setInfo('Check your email for a confirmation link.')
      }
    }

    setLoading(false)
  }

  return (
    <div className="auth-page">
      <button className="btn-theme-float" onClick={onToggleTheme} title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
        {theme === 'dark' ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="5" />
            <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        )}
      </button>
      <div className="auth-card">
        <div className="auth-logo">
          <span className="logo-icon">⛓️</span>
          <span className="logo-text">Chain</span>
        </div>
        <p className="auth-tagline">Build habits. Don't break the chain.</p>

        <div className="auth-tabs">
          <button
            className={mode === 'signin' ? 'active' : ''}
            onClick={() => { setMode('signin'); setError(null); setInfo(null) }}
          >
            Sign in
          </button>
          <button
            className={mode === 'signup' ? 'active' : ''}
            onClick={() => { setMode('signup'); setError(null); setInfo(null) }}
          >
            Sign up
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Email</label>
            <input
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label>Password</label>
            <input
              type="password"
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              minLength={6}
              required
            />
          </div>

          {error && <p className="auth-error">{error}</p>}
          {info && <p className="auth-info">{info}</p>}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Loading…' : mode === 'signin' ? 'Sign in' : 'Create account'}
          </button>
        </form>
      </div>
    </div>
  )
}
