import type { Habit, CompletionMap } from '../types'
import { getWeeklyBars } from '../utils/statsUtils'

interface Props {
  habits: Habit[]
  completions: CompletionMap
}

export default function WeeklyBarChart({ habits, completions }: Props) {
  const bars = getWeeklyBars(completions, habits)
  const maxVal = Math.max(...bars.map(b => b.done), 1)

  return (
    <div className="stat-card">
      <h4 className="stat-card-title">This Week</h4>
      <div className="weekly-bars">
        {bars.map(bar => {
          const pct = bar.total === 0 ? 0 : (bar.done / bar.total) * 100
          const heightPct = (bar.done / maxVal) * 100
          return (
            <div key={bar.date} className={`bar-col${bar.isToday ? ' today' : ''}`}>
              <span className="bar-count">{bar.done > 0 ? bar.done : ''}</span>
              <div className="bar-track">
                <div
                  className="bar-fill"
                  style={{
                    height: `${heightPct}%`,
                    background: pct >= 80
                      ? '#4ade80'
                      : pct >= 50
                        ? '#7c6fef'
                        : pct > 0
                          ? '#fb923c'
                          : 'transparent',
                  }}
                />
              </div>
              <span className="bar-label">{bar.label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
