import type { CompletionMap, Habit } from '../types'
import { today, subtractDays, addDays } from './dateUtils'

/** Returns the Monday of the ISO week containing `date`. */
function getWeekStart(date: string): string {
  const d = new Date(date + 'T00:00:00')
  const dow = d.getDay()
  const diff = dow === 0 ? -6 : 1 - dow
  d.setDate(d.getDate() + diff)
  return d.toISOString().slice(0, 10)
}

function countWeekCompletions(habitId: string, weekStart: string, completions: CompletionMap): number {
  let count = 0
  let cursor = weekStart
  const weekEnd = addDays(weekStart, 6)
  while (cursor <= weekEnd) {
    if ((completions[cursor] ?? []).includes(habitId)) count++
    cursor = addDays(cursor, 1)
  }
  return count
}

/** Streak in complete weeks for sub-weekly habits (frequency < 7). */
export function getWeeklyStreak(habitId: string, frequency: number, completions: CompletionMap): number {
  let streak = 0
  let weekStart = getWeekStart(today())

  if (countWeekCompletions(habitId, weekStart, completions) >= frequency) {
    streak = 1
  }

  let cursor = subtractDays(weekStart, 7)
  while (streak < 1000) {
    if (countWeekCompletions(habitId, cursor, completions) < frequency) break
    streak++
    cursor = subtractDays(cursor, 7)
  }

  return streak
}

/** How many times the habit has been completed in the current ISO week. */
export function getThisWeekCount(habitId: string, completions: CompletionMap): number {
  return countWeekCompletions(habitId, getWeekStart(today()), completions)
}

export function getStreak(habitId: string, completions: CompletionMap): number {
  let streak = 0
  let cursor = today()

  if (!(completions[cursor] ?? []).includes(habitId)) {
    cursor = subtractDays(cursor, 1)
  }

  while (true) {
    if (!(completions[cursor] ?? []).includes(habitId)) break
    streak++
    cursor = subtractDays(cursor, 1)
  }

  return streak
}

export function getCompletionRate(
  habitId: string,
  completions: CompletionMap,
  windowDays: number,
  frequency = 7,
): number {
  let completed = 0
  let cursor = subtractDays(today(), windowDays - 1)
  const end = today()

  while (cursor <= end) {
    if ((completions[cursor] ?? []).includes(habitId)) completed++
    cursor = addDays(cursor, 1)
  }

  const expected = (windowDays / 7) * frequency
  return Math.round((completed / expected) * 100)
}

export interface Milestone {
  days: number
  label: string
  color: string
}

export const MILESTONES: Milestone[] = [
  { days: 365, label: '1 year',   color: '#f472b6' },
  { days: 100, label: '100 days', color: '#60a5fa' },
  { days: 60,  label: '2 months', color: '#a78bfa' },
  { days: 30,  label: '1 month',  color: '#f59e0b' },
  { days: 14,  label: '2 weeks',  color: '#34d399' },
  { days: 7,   label: '1 week',   color: '#fb923c' },
  { days: 3,   label: '3 days',   color: '#94a3b8' },
]

export function getMilestone(streak: number): Milestone | null {
  return MILESTONES.find(m => streak >= m.days) ?? null
}

export interface HeatmapDay {
  date: string
  done: number
  total: number
}

export function getHeatmapDays(
  completions: CompletionMap,
  habits: Habit[],
  totalDays: number,
): HeatmapDay[] {
  const days: HeatmapDay[] = []
  const end = today()
  let cursor = subtractDays(end, totalDays - 1)

  while (cursor <= end) {
    const done = (completions[cursor] ?? []).length
    days.push({ date: cursor, done, total: habits.length })
    cursor = addDays(cursor, 1)
  }

  return days
}

/** All days from Jan 1 to Dec 31 of the given year. Future days have done=0. */
export function getCalendarYearDays(
  completions: CompletionMap,
  habits: Habit[],
  year: number,
): HeatmapDay[] {
  const days: HeatmapDay[] = []
  const todayStr = today()
  const start = `${year}-01-01`
  const end = `${year}-12-31`
  let cursor = start

  while (cursor <= end) {
    const done = cursor <= todayStr ? (completions[cursor] ?? []).length : 0
    days.push({ date: cursor, done, total: habits.length })
    cursor = addDays(cursor, 1)
  }

  return days
}

export function getLongestStreak(habitId: string, completions: CompletionMap): number {
  const allDates = Object.keys(completions).sort()
  if (allDates.length === 0) return 0

  let longest = 0
  let current = 0
  let prev: string | null = null

  for (const date of allDates) {
    if (!(completions[date] ?? []).includes(habitId)) {
      current = 0
      prev = null
      continue
    }
    if (prev === null) {
      current = 1
    } else {
      const diff =
        (new Date(date + 'T00:00:00').getTime() - new Date(prev + 'T00:00:00').getTime()) /
        86400000
      current = diff === 1 ? current + 1 : 1
    }
    longest = Math.max(longest, current)
    prev = date
  }

  return longest
}

// ── New stat functions ──────────────────────────────────────────────────────

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export interface DayBarData {
  date: string
  label: string
  done: number
  total: number
  isToday: boolean
}

/** Last 7 days as bar chart data. */
export function getWeeklyBars(completions: CompletionMap, habits: Habit[]): DayBarData[] {
  const todayStr = today()
  return Array.from({ length: 7 }, (_, i) => {
    const date = subtractDays(todayStr, 6 - i)
    const dow = new Date(date + 'T00:00:00').getDay()
    const monFirst = dow === 0 ? 6 : dow - 1
    return {
      date,
      label: DAY_LABELS[monFirst],
      done: (completions[date] ?? []).length,
      total: habits.length,
      isToday: date === todayStr,
    }
  })
}

/** Completion rate per day-of-week [Mon…Sun] for a habit over last N weeks. */
export function getDayOfWeekRates(
  habitId: string,
  completions: CompletionMap,
  weeks = 12,
): number[] {
  const done = new Array(7).fill(0)
  const total = new Array(7).fill(0)
  const todayStr = today()

  for (let i = weeks * 7 - 1; i >= 0; i--) {
    const date = subtractDays(todayStr, i)
    const dow = new Date(date + 'T00:00:00').getDay()
    const monFirst = dow === 0 ? 6 : dow - 1
    total[monFirst]++
    if ((completions[date] ?? []).includes(habitId)) done[monFirst]++
  }

  return done.map((d, i) => (total[i] === 0 ? 0 : d / total[i]))
}

/** Binary sparkline data for last N days (1 = done, 0 = missed). */
export function getSparklineData(
  habitId: string,
  completions: CompletionMap,
  days = 14,
): number[] {
  const todayStr = today()
  return Array.from({ length: days }, (_, i) => {
    const date = subtractDays(todayStr, days - 1 - i)
    return (completions[date] ?? []).includes(habitId) ? 1 : 0
  })
}

/** 0–100 consistency score: weighted recent rate + trend. */
export function getConsistencyScore(
  habitId: string,
  completions: CompletionMap,
  frequency: number,
): number {
  const rate14 = getCompletionRate(habitId, completions, 14, frequency) / 100

  // Compare last 7 days vs previous 7 days for trend
  let prev7Done = 0
  const todayStr = today()
  for (let i = 13; i >= 7; i--) {
    const date = subtractDays(todayStr, i)
    if ((completions[date] ?? []).includes(habitId)) prev7Done++
  }
  const prev7Expected = (7 / 7) * frequency
  const prev7Rate = prev7Expected === 0 ? 0 : prev7Done / prev7Expected
  const curr7Rate = getCompletionRate(habitId, completions, 7, frequency) / 100
  const trend = prev7Rate === 0
    ? (curr7Rate > 0 ? 1 : 0.5)
    : Math.min(curr7Rate / prev7Rate, 1)

  return Math.min(100, Math.round((rate14 * 0.65 + trend * 0.35) * 100))
}

/** Best and worst day of week across all habits (0 = Mon … 6 = Sun). */
export function getBestWorstDay(
  habits: Habit[],
  completions: CompletionMap,
): { best: number; worst: number; rates: number[] } {
  if (habits.length === 0) return { best: 0, worst: 0, rates: new Array(7).fill(0) }

  const sums = new Array(7).fill(0)
  const counts = new Array(7).fill(0)
  const todayStr = today()

  for (let i = 83; i >= 0; i--) {
    const date = subtractDays(todayStr, i)
    const dow = new Date(date + 'T00:00:00').getDay()
    const monFirst = dow === 0 ? 6 : dow - 1
    sums[monFirst] += (completions[date] ?? []).length / habits.length
    counts[monFirst]++
  }

  const rates = sums.map((s, i) => (counts[i] === 0 ? 0 : s / counts[i]))
  let best = 0, worst = 0
  for (let i = 1; i < 7; i++) {
    if (rates[i] > rates[best]) best = i
    if (rates[i] < rates[worst]) worst = i
  }

  return { best, worst, rates }
}

export interface StreakPeriod {
  start: string
  end: string
  length: number
}

/** All distinct streak periods for a habit, sorted longest first. */
export function getPastStreaks(habitId: string, completions: CompletionMap): StreakPeriod[] {
  const dates = Object.keys(completions)
    .filter(d => (completions[d] ?? []).includes(habitId))
    .sort()

  if (dates.length === 0) return []

  const periods: StreakPeriod[] = []
  let start = dates[0]
  let prev = dates[0]

  for (let i = 1; i < dates.length; i++) {
    const curr = dates[i]
    const diff =
      (new Date(curr + 'T00:00:00').getTime() - new Date(prev + 'T00:00:00').getTime()) /
      86400000
    if (diff === 1) {
      prev = curr
    } else {
      const len =
        (new Date(prev + 'T00:00:00').getTime() - new Date(start + 'T00:00:00').getTime()) /
          86400000 + 1
      periods.push({ start, end: prev, length: len })
      start = curr
      prev = curr
    }
  }
  const len =
    (new Date(prev + 'T00:00:00').getTime() - new Date(start + 'T00:00:00').getTime()) /
      86400000 + 1
  periods.push({ start, end: prev, length: len })

  return periods.sort((a, b) => b.length - a.length)
}

export interface MonthStats {
  rate: number
  totalCompletions: number
  bestDay: string | null
  bestDayCount: number
  perfectHabitIds: string[]
}

/** Completion statistics for a given month (month is 0-based). */
export function getMonthStats(
  completions: CompletionMap,
  habits: Habit[],
  year: number,
  month: number,
): MonthStats {
  const pad = (n: number) => String(n).padStart(2, '0')
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  let totalDone = 0
  let bestDayCount = 0
  let bestDay: string | null = null
  const habitCounts: Record<string, number> = {}

  for (let d = 1; d <= daysInMonth; d++) {
    const date = `${year}-${pad(month + 1)}-${pad(d)}`
    const done = completions[date] ?? []
    totalDone += done.length
    if (done.length > bestDayCount) { bestDayCount = done.length; bestDay = date }
    for (const id of done) habitCounts[id] = (habitCounts[id] ?? 0) + 1
  }

  const totalExpected = habits.reduce(
    (sum, h) => sum + Math.round((daysInMonth / 7) * h.frequency),
    0,
  )

  const perfectHabitIds = habits
    .filter(h => (habitCounts[h.id] ?? 0) >= Math.round((daysInMonth / 7) * h.frequency))
    .map(h => h.id)

  return {
    rate: totalExpected > 0 ? Math.round((totalDone / totalExpected) * 100) : 0,
    totalCompletions: totalDone,
    bestDay,
    bestDayCount,
    perfectHabitIds,
  }
}
