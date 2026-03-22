import { useMemo } from 'react'
import type { Habit, CompletionMap } from '../types'
import { getStreak, getLongestStreak, getMilestone } from '../utils/statsUtils'

interface Props {
  habits: Habit[]
  completions: CompletionMap
}

export default function StreakBoard({ habits, completions }: Props) {
  const rows = useMemo(() =>
    habits
      .map(h => ({
        habit: h,
        current: getStreak(h.id, completions),
        longest: getLongestStreak(h.id, completions),
      }))
      .sort((a, b) => b.current - a.current),
    [habits, completions],
  )

  const maxCurrent = rows[0]?.current ?? 0
  const activeCount = rows.filter(r => r.current > 0).length
  const allTimeLongest = rows.reduce((best, r) => r.longest > best.longest ? r : best, rows[0])

  if (habits.length === 0) return null

  return (
    <section className="streakboard-section">
      <div className="section-header">
        <h3 className="section-title">Streaks</h3>
        <span className="streakboard-active">{activeCount} / {habits.length} active</span>
      </div>

      <div className="streakboard-card">
        {rows.map(({ habit, current, longest }, i) => {
          const milestone = getMilestone(current)
          const barPct = maxCurrent > 0 ? (current / maxCurrent) * 100 : 0
          const isTop = i === 0 && current > 0

          return (
            <div
              key={habit.id}
              className={`sb-row${isTop ? ' sb-top' : ''}`}
              style={{ '--habit-color': habit.color } as React.CSSProperties}
            >
              <span className="sb-rank">{i + 1}</span>
              <span className="sb-emoji">{habit.emoji}</span>
              <div className="sb-info">
                <div className="sb-name-row">
                  <span className="sb-name">{habit.name}</span>
                  {milestone && (
                    <span
                      className="sb-milestone"
                      style={{ '--milestone-color': milestone.color } as React.CSSProperties}
                    >
                      {milestone.label}
                    </span>
                  )}
                </div>
                <div className="sb-bar-track">
                  <div className="sb-bar-fill" style={{ width: `${barPct}%` }} />
                </div>
              </div>
              <div className="sb-nums">
                <span className="sb-current">{current}d</span>
                {longest > current && <span className="sb-pb">PB {longest}d</span>}
              </div>
            </div>
          )
        })}

        {allTimeLongest && allTimeLongest.longest > 0 && (
          <div className="sb-footer">
            <span className="sb-footer-icon">🏆</span>
            <span className="sb-footer-text">
              All-time best:{' '}
              <strong>{allTimeLongest.longest} days</strong>
              {' '}—{' '}
              {allTimeLongest.habit.emoji} {allTimeLongest.habit.name}
            </span>
          </div>
        )}
      </div>
    </section>
  )
}
