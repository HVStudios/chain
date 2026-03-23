import type { Habit, CompletionMap } from '../types'
import { getLongestStreak, getBestWorstDay, getCompletionRate } from '../utils/statsUtils'

const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const DAY_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

interface Props {
  habits: Habit[]
  completions: CompletionMap
}

export default function PersonalRecords({ habits, completions }: Props) {
  const { best, worst, rates } = getBestWorstDay(habits, completions)

  // Habit with the longest all-time streak
  const records = habits.map(h => ({
    habit: h,
    longest: getLongestStreak(h.id, completions),
    rate30: getCompletionRate(h.id, completions, 30, h.frequency),
  }))

  const topStreak = records.reduce<typeof records[0] | null>(
    (acc, r) => (!acc || r.longest > acc.longest ? r : acc),
    null,
  )

  const mostConsistent = records.reduce<typeof records[0] | null>(
    (acc, r) => (!acc || r.rate30 > acc.rate30 ? r : acc),
    null,
  )

  // Best single day ever (most habits completed in one day)
  let bestDayDate: string | null = null
  let bestDayCount = 0
  for (const [date, ids] of Object.entries(completions)) {
    if (ids.length > bestDayCount) { bestDayCount = ids.length; bestDayDate = date }
  }

  return (
    <div className="stat-card">
      <h4 className="stat-card-title">Personal Records</h4>
      <div className="pr-grid">
        {topStreak && (
          <div className="pr-item">
            <span className="pr-icon">🏆</span>
            <div>
              <div className="pr-value">{topStreak.longest}d</div>
              <div className="pr-label">Best streak — {topStreak.habit.emoji} {topStreak.habit.name}</div>
            </div>
          </div>
        )}

        {bestDayDate && (
          <div className="pr-item">
            <span className="pr-icon">⚡</span>
            <div>
              <div className="pr-value">{bestDayCount}/{habits.length}</div>
              <div className="pr-label">Best single day — {bestDayDate}</div>
            </div>
          </div>
        )}

        {mostConsistent && (
          <div className="pr-item">
            <span className="pr-icon">🎯</span>
            <div>
              <div className="pr-value">{mostConsistent.rate30}%</div>
              <div className="pr-label">Most consistent — {mostConsistent.habit.emoji} {mostConsistent.habit.name}</div>
            </div>
          </div>
        )}

        <div className="pr-item">
          <span className="pr-icon">📈</span>
          <div>
            <div className="pr-value">{DAY_SHORT[best]}</div>
            <div className="pr-label">Best day — {Math.round(rates[best] * 100)}% avg</div>
          </div>
        </div>

        <div className="pr-item">
          <span className="pr-icon">📉</span>
          <div>
            <div className="pr-value">{DAY_SHORT[worst]}</div>
            <div className="pr-label">Weakest day — {Math.round(rates[worst] * 100)}% avg</div>
          </div>
        </div>

        <div className="pr-insight">
          You're most consistent on <strong>{DAY_NAMES[best]}</strong>
          {best !== worst && <> and struggle most on <strong>{DAY_NAMES[worst]}</strong></>}.
        </div>
      </div>
    </div>
  )
}
