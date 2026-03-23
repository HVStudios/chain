import type { Habit, CompletionMap } from '../types'
import { getPastStreaks } from '../utils/statsUtils'

interface Props {
  habits: Habit[]
  completions: CompletionMap
}

function formatDate(d: string): string {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function StreakTimeline({ habits, completions }: Props) {
  return (
    <div className="stat-card stat-card-wide">
      <h4 className="stat-card-title">Streak History</h4>
      <div className="streak-timeline">
        {habits.map(habit => {
          const streaks = getPastStreaks(habit.id, completions).slice(0, 5)
          return (
            <div key={habit.id} className="stl-row">
              <div className="stl-habit">
                <span>{habit.emoji}</span>
                <span className="stl-name">{habit.name}</span>
              </div>
              <div className="stl-bars">
                {streaks.length === 0 ? (
                  <span className="stl-empty">No streaks yet</span>
                ) : (
                  streaks.map((s, i) => (
                    <div
                      key={i}
                      className={`stl-segment${i === 0 ? ' best' : ''}`}
                      style={{
                        background: habit.color,
                        opacity: i === 0 ? 1 : 0.5 + (streaks.length - i) * 0.1,
                        minWidth: `${Math.max(s.length * 2, 28)}px`,
                      }}
                      title={`${s.length} days — ${formatDate(s.start)} to ${formatDate(s.end)}`}
                    >
                      <span className="stl-len">{s.length}d</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
