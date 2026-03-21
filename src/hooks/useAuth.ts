import { useEffect, useState, useCallback } from 'react'
import type { User, AuthError } from '@supabase/supabase-js'
import { supabase } from '../lib/supabaseClient'

interface AuthState {
  user: User | null
  loading: boolean
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({ user: null, loading: true })

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setState({ user: session?.user ?? null, loading: false })
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setState(prev => ({ ...prev, user: session?.user ?? null }))
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = useCallback(
    (email: string, password: string): Promise<{ error: AuthError | null }> =>
      supabase.auth.signInWithPassword({ email, password }).then(({ error }) => ({ error })),
    [],
  )

  const signUp = useCallback(
    (email: string, password: string): Promise<{ error: AuthError | null; needsConfirmation: boolean }> =>
      supabase.auth.signUp({ email, password }).then(({ data, error }) => ({
        error,
        needsConfirmation: !error && data.user?.identities?.length === 0 || !data.session,
      })),
    [],
  )

  const signOut = useCallback(() => supabase.auth.signOut(), [])

  return { ...state, signIn, signUp, signOut }
}
