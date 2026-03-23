import type { Habit, CompletionMap } from '../types'
import { getMonthStats } from '../utils/statsUtils'

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December']

interface Props {
  habits: Habit[]
  completions: CompletionMap
}

function rateLabel(rate: number): { text: string; color: string } {
  if (rate >= 90) return { text: 'Excellent', color: '#4ade80' }
  if (rate >= 75) return { text: 'Great', color: '#34d399' }
  if (rate >= 60) return { text: 'Good', color: '#7c6fef' }
  if (rate >= 40) return { text: 'Fair', color: '#facc15' }
  return { text: 'Needs work', color: '#fb923c' }
}

export default function MonthlySummary({ habits, completions }: Props) {
  const now = new Date()
  const thisYear = now.getFullYear()
  const thisMonth = now.getMonth()

  const prevMonth = thisMonth === 0 ? 11 : thisMonth - 1
  const prevYear = thisMonth === 0 ? thisYear - 1 : thisYear

  const current = getMonthStats(completions, habits, thisYear, thisMonth)
  const previous = getMonthStats(completions, habits, prevYear, prevMonth)

  const { text: ratingText, color: ratingColor } = rateLabel(current.rate)
  const delta = current.rate - previous.rate

  const perfectHabits = habits.filter(h => current.perfectHabitIds.includes(h.id))

  return (
    <div className="stat-card">
      <h4 className="stat-card-title">
        {MONTH_NAMES[thisMonth]} in Review
      </h4>

      <div className="month-rate-row">
        <span className="month-big-rate" style={{ color: ratingColor }}>{current.rate}%</span>
        <div className="month-rate-meta">
          <span className="month-rating" style={{ color: ratingColor }}>{ratingText}</span>
          {previous.rate > 0 && (
            <span className={`month-delta ${delta >= 0 ? 'up' : 'down'}`}>
              {delta >= 0 ? '▲' : '▼'} {Math.abs(delta)}% vs {MONTH_NAMES[prevMonth]}
            </span>
          )}
        </div>
      </div>

      <div className="month-stats-grid">
        <div className="month-stat">
          <span className="month-stat-value">{current.totalCompletions}</span>
          <span className="month-stat-label">check-ins</span>
        </div>
        <div className="month-stat">
          <span className="month-stat-value">{perfectHabits.length}/{habits.length}</span>
          <span className="month-stat-label">perfect habits</span>
        </div>
        {current.bestDayCount > 0 && (
          <div className="month-stat">
            <span className="month-stat-value">{current.bestDayCount}</span>
            <span className="month-stat-label">best day</span>
          </div>
        )}
      </div>

      {perfectHabits.length > 0 && (
        <div className="month-perfect">
          {perfectHabits.map(h => (
            <span key={h.id} className="month-perfect-chip" style={{ borderColor: h.color }}>
              {h.emoji} {h.name}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
