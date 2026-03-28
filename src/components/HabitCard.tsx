import type { Habit, CompletionMap } from '../types'
import { getStreak, getCompletionRate } from '../utils/statsUtils'
import { today } from '../utils/dateUtils'

interface Props {
  habit: Habit
  date: string
  completions: CompletionMap
  isCompleted: (habitId: string, date: string) => boolean
  onToggle: (habitId: string, date: string) => void
  onDelete: (habitId: string) => void
}

export default function HabitCard({ habit, date, completions, isCompleted, onToggle, onDelete }: Props) {
  const done = isCompleted(habit.id, date)
  const isToday = date === today()
  const streak = getStreak(habit.id, completions)
  const rate = getCompletionRate(habit.id, completions, 7, habit.frequency)

  return (
    <div
      className={`habit-card${done ? ' done' : ''}`}
      style={{ '--habit-color': habit.color } as React.CSSProperties}
      onClick={() => isToday && onToggle(habit.id, date)}
      role={isToday ? 'button' : undefined}
      tabIndex={isToday ? 0 : undefined}
      onKeyDown={e => isToday && e.key === 'Enter' && onToggle(habit.id, date)}
    >
      {/* Delete button — visible on hover/focus */}
      <button
        className="habit-card-delete"
        onClick={e => { e.stopPropagation(); onDelete(habit.id) }}
        title="Delete habit"
        tabIndex={-1}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      {/* Done checkmark */}
      <div className="habit-card-check" aria-hidden>
        <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>

      <div className="habit-card-emoji-wrap">
        <span className="habit-card-emoji">{habit.emoji}</span>
      </div>
      <span className="habit-card-name">{habit.name}</span>

      <div className="habit-card-footer">
        {streak > 0 && (
          <span className="habit-card-streak">🔥 {streak}d</span>
        )}
        <span className="habit-card-rate">{rate}%</span>
      </div>

      {!isToday && (
        <div className="habit-card-past-overlay" title="Past day — view only" />
      )}
    </div>
  )
}
