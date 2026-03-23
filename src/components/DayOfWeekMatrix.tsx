import type { Habit, CompletionMap } from '../types'
import { getDayOfWeekRates } from '../utils/statsUtils'

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

interface Props {
  habits: Habit[]
  completions: CompletionMap
}

function rateToOpacity(rate: number): number {
  return 0.08 + rate * 0.92
}

export default function DayOfWeekMatrix({ habits, completions }: Props) {
  return (
    <div className="stat-card stat-card-wide">
      <h4 className="stat-card-title">Day of Week Patterns <span className="stat-card-sub">last 12 weeks</span></h4>
      <div className="dow-matrix">
        {/* Header row */}
        <div className="dow-habit-label" />
        {DAY_LABELS.map(d => (
          <div key={d} className="dow-day-header">{d}</div>
        ))}

        {/* Data rows */}
        {habits.map(habit => {
          const rates = getDayOfWeekRates(habit.id, completions)
          return (
            <>
              <div key={habit.id + '-label'} className="dow-habit-label">
                <span className="dow-emoji">{habit.emoji}</span>
                <span className="dow-name">{habit.name}</span>
              </div>
              {rates.map((rate, di) => (
                <div
                  key={habit.id + '-' + di}
                  className="dow-cell"
                  title={`${habit.name} on ${DAY_LABELS[di]}: ${Math.round(rate * 100)}%`}
                  style={{
                    background: habit.color,
                    opacity: rate === 0 ? 0.06 : rateToOpacity(rate),
                  }}
                />
              ))}
            </>
          )
        })}
      </div>
    </div>
  )
}
