import { useState, FormEvent } from 'react'
import type { AuthError } from '@supabase/supabase-js'

interface Props {
  onSignIn: (email: string, password: string) => Promise<{ error: AuthError | null }>
  onSignUp: (
    email: string,
    password: string,
  ) => Promise<{ error: AuthError | null; needsConfirmation: boolean }>
}

export default function AuthPage({ onSignIn, onSignUp }: Props) {
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
