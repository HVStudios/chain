import type { Habit, CompletionMap } from '../types'
import { getStreak, getCompletionRate, getLongestStreak } from '../utils/statsUtils'

interface Props {
  habit: Habit
  completions: CompletionMap
  isCompleted: (habitId: string) => boolean
  onToggle: (habitId: string) => void
  onDelete: (habitId: string) => void
  window: number
}

export default function HabitRow({
  habit,
  completions,
  isCompleted,
  onToggle,
  onDelete,
  window: windowDays,
}: Props) {
  const streak = getStreak(habit.id, completions)
  const rate = getCompletionRate(habit.id, completions, windowDays)
  const longest = getLongestStreak(habit.id, completions)
  const done = isCompleted(habit.id)

  return (
    <div
      className={`habit-row${done ? ' done' : ''}`}
      style={{ '--habit-color': habit.color } as React.CSSProperties}
    >
      <button
        className="check-btn"
        onClick={() => onToggle(habit.id)}
        aria-label={done ? 'Mark incomplete' : 'Mark complete'}
      >
        {done && (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </button>

      <span className="habit-emoji">{habit.emoji}</span>

      <div className="habit-info">
        <span className="habit-name">{habit.name}</span>
        <div className="habit-meta">
          <span className="meta-stat" title={`Longest streak: ${longest}`}>
            🔥 {streak} day{streak !== 1 ? 's' : ''}
          </span>
          <span className="meta-divider" />
          <span className="meta-stat">{rate}% last {windowDays}d</span>
        </div>
      </div>

      <div className="habit-rate-bar" title={`${rate}%`}>
        <div className="rate-fill" style={{ width: `${rate}%` }} />
      </div>

      <button className="delete-btn" onClick={() => onDelete(habit.id)} aria-label="Delete habit">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6l-1 14H6L5 6" />
          <path d="M10 11v6M14 11v6" />
          <path d="M9 6V4h6v2" />
        </svg>
      </button>
    </div>
  )
}
