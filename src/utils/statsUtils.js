import { today, subtractDays, addDays, toDateString } from './dateUtils'

export function getStreak(habitId, completions) {
  let streak = 0
  let cursor = today()

  // If today is not done, start checking from yesterday
  const todayCompletions = completions[cursor] || []
  if (!todayCompletions.includes(habitId)) {
    cursor = subtractDays(cursor, 1)
  }

  while (true) {
    const dayCompletions = completions[cursor] || []
    if (!dayCompletions.includes(habitId)) break
    streak++
    cursor = subtractDays(cursor, 1)
  }

  return streak
}

export function getCompletionRate(habitId, completions, windowDays) {
  let completed = 0
  let cursor = subtractDays(today(), windowDays - 1)
  const end = today()

  while (cursor <= end) {
    const dayCompletions = completions[cursor] || []
    if (dayCompletions.includes(habitId)) completed++
    cursor = addDays(cursor, 1)
  }

  return Math.round((completed / windowDays) * 100)
}

export function getHeatmapDays(completions, habits, totalDays) {
  const days = []
  const end = today()
  let cursor = subtractDays(end, totalDays - 1)

  while (cursor <= end) {
    const done = (completions[cursor] || []).length
    const total = habits.length
    days.push({ date: cursor, done, total })
    cursor = addDays(cursor, 1)
  }

  return days
}

export function getLongestStreak(habitId, completions) {
  const allDates = Object.keys(completions).sort()
  if (allDates.length === 0) return 0

  let longest = 0
  let current = 0
  let prev = null

  for (const date of allDates) {
    if (!(completions[date] || []).includes(habitId)) {
      current = 0
      prev = null
      continue
    }
    if (prev === null) {
      current = 1
    } else {
      const diff = (new Date(date + 'T00:00:00') - new Date(prev + 'T00:00:00')) / 86400000
      current = diff === 1 ? current + 1 : 1
    }
    longest = Math.max(longest, current)
    prev = date
  }

  return longest
}
