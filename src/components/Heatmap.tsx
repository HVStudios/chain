import type { Habit, CompletionMap } from '../types'
import type { HeatmapDay } from '../utils/statsUtils'
import { getHeatmapDays } from '../utils/statsUtils'
import { getDayOfWeek, formatDate } from '../utils/dateUtils'

const WEEK_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
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
  const days = getHeatmapDays(completions, habits, 105) // 15 weeks
  const firstDOW = getDayOfWeek(days[0].date)
  const paddingCells = firstDOW

  const cells: (HeatmapDay | null)[] = [...Array(paddingCells).fill(null), ...days]

  const weeks: (HeatmapDay | null)[][] = []
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7))
  }

  const monthLabels: { month: string; weekIndex: number }[] = []
  let lastMonth: string | null = null
  days.forEach((day, i) => {
    const month = day.date.slice(0, 7)
    if (month !== lastMonth) {
      monthLabels.push({ month, weekIndex: Math.floor((i + paddingCells) / 7) })
      lastMonth = month
    }
  })

  return (
    <section className="heatmap-section">
      <h3 className="section-title">Activity</h3>
      <div className="heatmap-wrap">
        <div className="heatmap-month-row">
          {weeks.map((_, wi) => {
            const label = monthLabels.find(m => m.weekIndex === wi)
            if (label) {
              const m = parseInt(label.month.split('-')[1]) - 1
              return <span key={wi} className="month-label">{MONTH_NAMES[m]}</span>
            }
            return <span key={wi} className="month-label" />
          })}
        </div>

        <div className="heatmap-grid">
          <div className="day-labels">
            {WEEK_LABELS.map((d, i) => (
              <span key={d} className={`day-label${i % 2 === 0 ? '' : ' hidden'}`}>{d}</span>
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

        <div className="heatmap-legend">
          <span className="legend-label">Less</span>
          {(['h0', 'h1', 'h2', 'h3', 'h4'] as const).map(c => (
            <div key={c} className={`heatmap-cell ${c}`} />
          ))}
          <span className="legend-label">More</span>
        </div>
      </div>
    </section>
  )
}
