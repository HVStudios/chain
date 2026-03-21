import { useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { useAuth } from './hooks/useAuth'
import { useHabits } from './hooks/useHabits'
import HabitRow from './components/HabitRow'
import Heatmap from './components/Heatmap'
import AddHabitModal from './components/AddHabitModal'
import AuthPage from './components/AuthPage'
import { formatDate, today } from './utils/dateUtils'

export default function App() {
  const { user, loading: authLoading, signIn, signUp, signOut } = useAuth()

  if (authLoading) {
    return (
      <div className="splash">
        <span className="splash-spinner" />
      </div>
    )
  }

  if (!user) {
    return <AuthPage onSignIn={signIn} onSignUp={signUp} />
  }

  return <AppContent user={user} onSignOut={signOut} />
}

interface AppContentProps {
  user: User
  onSignOut: () => void
}

function AppContent({ user, onSignOut }: AppContentProps) {
  const { habits, completions, loading, toggleHabit, addHabit, deleteHabit, isCompleted } =
    useHabits(user.id)
  const [showModal, setShowModal] = useState(false)
  const [windowDays, setWindowDays] = useState(7)

  const todayStr = today()
  const todayDone = (completions[todayStr] ?? []).length
  const allDone = habits.length > 0 && todayDone === habits.length
  const progress = habits.length > 0 ? (todayDone / habits.length) * 100 : 0

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-top">
          <div className="logo">
            <span className="logo-icon">⛓️</span>
            <span className="logo-text">Chain</span>
          </div>
          <div className="header-actions">
            <button className="btn-add" onClick={() => setShowModal(true)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              New Habit
            </button>
            <button className="btn-signout" onClick={onSignOut} title={`Sign out (${user.email})`}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="today-card">
          <div className="today-info">
            <span className="today-label">{formatDate(todayStr)}</span>
            <span className="today-count">
              {loading
                ? 'Loading…'
                : allDone
                  ? '🎉 All done!'
                  : `${todayDone} / ${habits.length} completed`}
            </span>
          </div>
          <div className="progress-bar">
            <div
              className={`progress-fill${allDone ? ' complete' : ''}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </header>

      <main className="app-main">
        <section className="habits-section">
          <div className="section-header">
            <h3 className="section-title">Today</h3>
            <div className="window-toggle">
              <button
                className={windowDays === 7 ? 'active' : ''}
                onClick={() => setWindowDays(7)}
              >
                7d
              </button>
              <button
                className={windowDays === 30 ? 'active' : ''}
                onClick={() => setWindowDays(30)}
              >
                30d
              </button>
            </div>
          </div>

          {loading ? (
            <div className="loading-state">
              <span className="splash-spinner" />
            </div>
          ) : habits.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">🌱</span>
              <p>No habits yet. Add one to get started!</p>
              <button className="btn-primary" onClick={() => setShowModal(true)}>
                Add your first habit
              </button>
            </div>
          ) : (
            <div className="habits-list">
              {habits.map(habit => (
                <HabitRow
                  key={habit.id}
                  habit={habit}
                  completions={completions}
                  isCompleted={isCompleted}
                  onToggle={toggleHabit}
                  onDelete={deleteHabit}
                  window={windowDays}
                />
              ))}
            </div>
          )}
        </section>

        {!loading && habits.length > 0 && (
          <Heatmap completions={completions} habits={habits} />
        )}
      </main>

      {showModal && (
        <AddHabitModal
          onAdd={addHabit}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  )
}
