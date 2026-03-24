import { useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { useAuth } from './hooks/useAuth'
import { useTheme } from './hooks/useTheme'
import { useHabits } from './hooks/useHabits'
import HabitRow from './components/HabitRow'
import Heatmap from './components/Heatmap'
import StreakBoard from './components/StreakBoard'
import WeeklyBarChart from './components/WeeklyBarChart'
import PersonalRecords from './components/PersonalRecords'
import DayOfWeekMatrix from './components/DayOfWeekMatrix'
import StreakTimeline from './components/StreakTimeline'
import MonthlySummary from './components/MonthlySummary'
import AddHabitModal from './components/AddHabitModal'
import AuthPage from './components/AuthPage'
import { formatDate, today } from './utils/dateUtils'

export default function App() {
  const { user, loading: authLoading, signIn, signUp, signOut } = useAuth()
  const { theme, toggle: toggleTheme } = useTheme()

  if (authLoading) {
    return (
      <div className="splash">
        <span className="splash-spinner" />
      </div>
    )
  }

  if (!user) {
    return <AuthPage onSignIn={signIn} onSignUp={signUp} onToggleTheme={toggleTheme} theme={theme} />
  }

  return <AppContent user={user} onSignOut={signOut} onToggleTheme={toggleTheme} theme={theme} />
}

interface AppContentProps {
  user: User
  onSignOut: () => void
  onToggleTheme: () => void
  theme: 'light' | 'dark'
}

function AppContent({ user, onSignOut, onToggleTheme, theme }: AppContentProps) {
  const { habits, completions, loading, toggleHabit, addHabit, deleteHabit, isCompleted } =
    useHabits(user.id)
  const [showModal, setShowModal] = useState(false)
  const [windowDays, setWindowDays] = useState(7)

  const todayStr = today()
  const todayDone = (completions[todayStr] ?? []).length
  const allDone = habits.length > 0 && todayDone === habits.length
  const progress = habits.length > 0 ? (todayDone / habits.length) * 100 : 0

  return (
    <>
      <header className="app-header">
        <div className="header-inner">
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
              <button className="btn-icon" onClick={onToggleTheme} title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
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
              <button className="btn-icon" onClick={onSignOut} title={`Sign out (${user.email})`}>
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
        </div>
      </header>

      <div className="app">
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
          <StreakBoard habits={habits} completions={completions} />
        )}
      </main>

      {!loading && habits.length > 0 && (
        <div className="stats-panel">
          <WeeklyBarChart habits={habits} completions={completions} />
          <MonthlySummary habits={habits} completions={completions} />
          <PersonalRecords habits={habits} completions={completions} />
          <DayOfWeekMatrix habits={habits} completions={completions} />
          <StreakTimeline habits={habits} completions={completions} />
        </div>
      )}

      {showModal && (
        <AddHabitModal
          onAdd={addHabit}
          onClose={() => setShowModal(false)}
        />
      )}
      </div>

      {!loading && habits.length > 0 && (
        <div className="heatmap-outer">
          <Heatmap completions={completions} habits={habits} />
        </div>
      )}
    </>
  )
}
