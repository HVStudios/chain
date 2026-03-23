import type { CompletionMap, Habit } from '../types'
import { today, subtractDays, addDays } from './dateUtils'

/** Returns the Monday of the ISO week containing `date`. */
function getWeekStart(date: string): string {
  const d = new Date(date + 'T00:00:00')
  const dow = d.getDay() // 0 = Sun
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

  // Include current week if already complete
  if (countWeekCompletions(habitId, weekStart, completions) >= frequency) {
    streak = 1
  }

  // Walk backwards through past complete weeks
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

  // Expected completions over the window adjusted for frequency
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
