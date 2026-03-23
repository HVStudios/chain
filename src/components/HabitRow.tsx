import type { Habit, CompletionMap } from '../types'
import {
  getStreak, getWeeklyStreak, getThisWeekCount,
  getCompletionRate, getLongestStreak, getMilestone,
  getSparklineData, getConsistencyScore,
} from '../utils/statsUtils'
import Sparkline from './Sparkline'

interface Props {
  habit: Habit
  completions: CompletionMap
  isCompleted: (habitId: string) => boolean
  onToggle: (habitId: string) => void
  onDelete: (habitId: string) => void
  window: number
}

function scoreColor(score: number): string {
  if (score >= 80) return '#4ade80'
  if (score >= 60) return '#facc15'
  if (score >= 40) return '#fb923c'
  return '#f43f5e'
}

export default function HabitRow({
  habit,
  completions,
  isCompleted,
  onToggle,
  onDelete,
  window: windowDays,
}: Props) {
  const isDaily = habit.frequency === 7
  const done = isCompleted(habit.id)

  const streak = isDaily
    ? getStreak(habit.id, completions)
    : getWeeklyStreak(habit.id, habit.frequency, completions)

  const rate = getCompletionRate(habit.id, completions, windowDays, habit.frequency)
  const longest = isDaily ? getLongestStreak(habit.id, completions) : null
  const milestone = getMilestone(streak)
  const sparkData = getSparklineData(habit.id, completions, 14)
  const score = getConsistencyScore(habit.id, completions, habit.frequency)

  const thisWeekCount = isDaily ? null : getThisWeekCount(habit.id, completions)
  const weekComplete = !isDaily && thisWeekCount !== null && thisWeekCount >= habit.frequency

  const atRisk = isDaily ? streak > 0 && !done : streak > 0 && !weekComplete

  return (
    <div
      className={`habit-row${done ? ' done' : ''}${atRisk ? ' at-risk' : ''}`}
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
        <div className="habit-name-row">
          <span className="habit-name">{habit.name}</span>
          {!isDaily && <span className="freq-badge">{habit.frequency}×/wk</span>}
          <span
            className="consistency-score"
            style={{ color: scoreColor(score) }}
            title={`Consistency score: ${score}/100`}
          >
            {score}
          </span>
        </div>

        <div className="habit-meta">
          {isDaily ? (
            <>
              <span className={`meta-stat streak-stat${atRisk ? ' at-risk' : ''}`}>
                🔥 {streak}d
                {atRisk && <span className="streak-risk-dot" title="Complete today to keep your streak!" />}
              </span>
              {milestone && (
                <span
                  className="streak-milestone"
                  style={{ '--milestone-color': milestone.color } as React.CSSProperties}
                >
                  {milestone.label}
                </span>
              )}
              {longest !== null && longest > streak && (
                <>
                  <span className="meta-divider" />
                  <span className="meta-stat pb-stat">PB {longest}d</span>
                </>
              )}
            </>
          ) : (
            <>
              <span className={`meta-stat streak-stat${atRisk ? ' at-risk' : ''}`}>
                🔥 {streak}wk
                {atRisk && <span className="streak-risk-dot" title="Complete this week to keep your streak!" />}
              </span>
              {milestone && (
                <span
                  className="streak-milestone"
                  style={{ '--milestone-color': milestone.color } as React.CSSProperties}
                >
                  {milestone.label}
                </span>
              )}
              <span className="meta-divider" />
              <span className={`meta-stat week-count${weekComplete ? ' week-done' : ''}`}>
                {thisWeekCount}/{habit.frequency} this wk
              </span>
            </>
          )}
          <span className="meta-divider" />
          <span className="meta-stat">{rate}% last {windowDays}d</span>
        </div>

        <Sparkline data={sparkData} color={habit.color} />
      </div>

      <div className="habit-rate-bar" title={`${rate}%`}>
        <div className="rate-fill" style={{ width: `${Math.min(rate, 100)}%` }} />
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
