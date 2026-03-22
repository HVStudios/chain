import type { Habit, CompletionMap } from '../types'
import type { HeatmapDay } from '../utils/statsUtils'
import { getHeatmapDays } from '../utils/statsUtils'
import { getDayOfWeek, formatDate } from '../utils/dateUtils'

// Monday-first
const WEEK_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function intensityClass(done: number, total: number): string {
  if (total === 0 || done === 0) return 'h0'
  const pct = done / total
  if (pct <= 0.25) return 'h1'
  if (pct <= 0.5) return 'h2'
  if (pct <= 0.75) return 'h3'
  return 'h4'
}

interface Props {
  completions: CompletionMap
  habits: Habit[]
}

export default function Heatmap({ completions, habits }: Props) {
  const days = getHeatmapDays(completions, habits, 365)

  // Convert Sunday-based (0=Sun) to Monday-based (0=Mon)
  const firstDOW = (getDayOfWeek(days[0].date) + 6) % 7
  const paddingCells = firstDOW

  const cells: (HeatmapDay | null)[] = [...Array(paddingCells).fill(null), ...days]

  const weeks: (HeatmapDay | null)[][] = []
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7))
  }

  // Label the first week column that contains any day from a new month
  const monthLabels: (string | null)[] = weeks.map((week, wi) => {
    for (const cell of week) {
      if (!cell) continue
      const month = cell.date.slice(0, 7)
      const seenBefore = weeks.slice(0, wi).some(w => w.some(c => c?.date.slice(0, 7) === month))
      if (!seenBefore) return month
    }
    return null
  })

  return (
    <section className="heatmap-section">
      <div className="section-header heatmap-section-header">
        <h3 className="section-title">Activity</h3>
        <div className="heatmap-legend">
          <span className="legend-label">Less</span>
          {(['h0', 'h1', 'h2', 'h3', 'h4'] as const).map(c => (
            <div key={c} className={`heatmap-cell ${c}`} />
          ))}
          <span className="legend-label">More</span>
        </div>
      </div>

      <div className="heatmap-wrap">
        {/* Single scroll container so month labels move with week columns */}
        <div className="heatmap-scroll">
          <div className="heatmap-inner">
            {/* Month labels row — one slot per week column */}
            <div className="heatmap-month-row">
              <div className="day-label-spacer" />
              {weeks.map((_, wi) => {
                const label = monthLabels[wi]
                const m = label ? parseInt(label.split('-')[1]) - 1 : null
                return (
                  <span key={wi} className="month-label">
                    {m !== null ? MONTH_NAMES[m] : ''}
                  </span>
                )
              })}
            </div>

            {/* Grid: day labels + week columns */}
            <div className="heatmap-grid">
              <div className="day-labels">
                {WEEK_LABELS.map((d, i) => (
                  <span key={d} className={`day-label${i % 2 !== 0 ? ' hidden' : ''}`}>{d}</span>
                ))}
              </div>
              <div className="heatmap-weeks">
                {weeks.map((week, wi) => (
                  <div key={wi} className="heatmap-week">
                    {week.map((cell, di) => {
                      if (!cell) return <div key={di} className="heatmap-cell empty" />
                      const cls = intensityClass(cell.done, cell.total)
                      return (
                        <div
                          key={di}
                          className={`heatmap-cell ${cls}`}
                          title={`${formatDate(cell.date)}: ${cell.done}/${cell.total} habits`}
                        />
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
