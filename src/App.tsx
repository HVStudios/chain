import { useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { useAuth } from './hooks/useAuth'
import { useTheme } from './hooks/useTheme'
import { useHabits } from './hooks/useHabits'
import BottomNav, { type Tab } from './components/BottomNav'
import DaySelector from './components/DaySelector'
import HabitCard from './components/HabitCard'
import Heatmap from './components/Heatmap'
import StreakBoard from './components/StreakBoard'
import WeeklyBarChart from './components/WeeklyBarChart'
import PersonalRecords from './components/PersonalRecords'
import DayOfWeekMatrix from './components/DayOfWeekMatrix'
import StreakTimeline from './components/StreakTimeline'
import MonthlySummary from './components/MonthlySummary'
import AddHabitModal from './components/AddHabitModal'
import AuthPage from './components/AuthPage'
import ProfileTab from './components/ProfileTab'
import { today } from './utils/dateUtils'

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

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

function AppContent({ user, onSignOut, onToggleTheme, theme }: AppContentProps) {
  const { habits, completions, loading, toggleHabit, addHabit, deleteHabit, isCompleted } = useHabits(user.id)
  const [tab, setTab] = useState<Tab>('home')
  const [selectedDate, setSelectedDate] = useState(today())
  const [showModal, setShowModal] = useState(false)

  const todayStr = today()
  const isViewingToday = selectedDate === todayStr
  const selectedDone = (completions[selectedDate] ?? []).length
  const allDone = habits.length > 0 && selectedDone >= habits.length

  return (
    <>
      {/* ── Header ── */}
      <header className="app-header">
        <div className="header-inner">
          {tab === 'home' && (
            <div className="header-top">
              <div className="header-greeting">
                <span className="header-greeting-sub">{getGreeting()}</span>
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
              </div>
            </div>
          )}
          {tab !== 'home' && (
            <div className="header-top header-top--centered">
              <span className="header-tab-title">
                {tab === 'stats' && 'Statistics'}
                {tab === 'activity' && 'Activity'}
                {tab === 'profile' && 'Profile'}
              </span>
            </div>
          )}
        </div>
      </header>

      {/* ── Tab content ── */}
      <div className="tab-content">

        {/* HOME */}
        {tab === 'home' && (
          <div className="home-tab">
            {/* Day selector */}
            <div className="day-selector-container">
              <DaySelector
                selectedDate={selectedDate}
                onSelect={setSelectedDate}
                completions={completions}
                habits={habits}
              />
            </div>

            {/* Progress summary */}
            {!loading && habits.length > 0 && (
              <div className="day-summary">
                <span className="day-summary-label">
                  {isViewingToday ? 'Today' : new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                </span>
                <span className={`day-summary-count${allDone ? ' all-done' : ''}`}>
                  {allDone ? '🎉 All done!' : `${selectedDone} / ${habits.length}`}
                </span>
              </div>
            )}

            {/* Habit grid */}
            {loading ? (
              <div className="loading-state"><span className="splash-spinner" /></div>
            ) : habits.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">🌱</span>
                <p>No habits yet. Add one to get started!</p>
                <button className="btn-primary" onClick={() => setShowModal(true)}>
                  Add your first habit
                </button>
              </div>
            ) : (
              <div className="habit-grid">
                {habits.map(habit => (
                  <HabitCard
                    key={habit.id}
                    habit={habit}
                    date={selectedDate}
                    completions={completions}
                    isCompleted={isCompleted}
                    onToggle={toggleHabit}
                    onDelete={deleteHabit}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* STATS */}
        {tab === 'stats' && (
          <div className="stats-tab">
            {loading ? (
              <div className="loading-state"><span className="splash-spinner" /></div>
            ) : habits.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">📊</span>
                <p>Add some habits to see your stats.</p>
              </div>
            ) : (
              <>
                <StreakBoard habits={habits} completions={completions} />
                <div className="stats-panel">
                  <WeeklyBarChart habits={habits} completions={completions} />
                  <MonthlySummary habits={habits} completions={completions} />
                  <PersonalRecords habits={habits} completions={completions} />
                  <DayOfWeekMatrix habits={habits} completions={completions} />
                  <StreakTimeline habits={habits} completions={completions} />
                </div>
              </>
            )}
          </div>
        )}

        {/* ACTIVITY */}
        {tab === 'activity' && (
          <div className="activity-tab">
            {loading ? (
              <div className="loading-state"><span className="splash-spinner" /></div>
            ) : habits.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">📅</span>
                <p>Add some habits to see your activity.</p>
              </div>
            ) : (
              <Heatmap completions={completions} habits={habits} />
            )}
          </div>
        )}

        {/* PROFILE */}
        {tab === 'profile' && (
          <ProfileTab
            user={user}
            onSignOut={onSignOut}
            onToggleTheme={onToggleTheme}
            theme={theme}
          />
        )}
      </div>

      <BottomNav active={tab} onChange={setTab} />

      {showModal && (
        <AddHabitModal onAdd={addHabit} onClose={() => setShowModal(false)} />
      )}
    </>
  )
}
