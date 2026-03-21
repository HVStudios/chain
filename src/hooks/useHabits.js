import { useState, useEffect, useCallback } from 'react'
import { today } from '../utils/dateUtils'

const STORAGE_KEY = 'chain_habits'
const COMPLETIONS_KEY = 'chain_completions'

function generateId() {
  return Math.random().toString(36).slice(2, 10)
}

const DEFAULT_HABITS = [
  { id: generateId(), name: 'Exercise', emoji: '🏃', color: '#f97316', createdAt: today() },
  { id: generateId(), name: 'Read', emoji: '📚', color: '#6c63ff', createdAt: today() },
  { id: generateId(), name: 'Drink water', emoji: '💧', color: '#38bdf8', createdAt: today() },
]

export function useHabits() {
  const [habits, setHabits] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : DEFAULT_HABITS
    } catch {
      return DEFAULT_HABITS
    }
  })

  const [completions, setCompletions] = useState(() => {
    try {
      const stored = localStorage.getItem(COMPLETIONS_KEY)
      return stored ? JSON.parse(stored) : {}
    } catch {
      return {}
    }
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(habits))
  }, [habits])

  useEffect(() => {
    localStorage.setItem(COMPLETIONS_KEY, JSON.stringify(completions))
  }, [completions])

  const toggleHabit = useCallback((habitId, date = today()) => {
    setCompletions(prev => {
      const dayDone = prev[date] || []
      const alreadyDone = dayDone.includes(habitId)
      return {
        ...prev,
        [date]: alreadyDone
          ? dayDone.filter(id => id !== habitId)
          : [...dayDone, habitId],
      }
    })
  }, [])

  const addHabit = useCallback((name, emoji, color) => {
    setHabits(prev => [
      ...prev,
      { id: generateId(), name, emoji, color, createdAt: today() },
    ])
  }, [])

  const deleteHabit = useCallback((habitId) => {
    setHabits(prev => prev.filter(h => h.id !== habitId))
    setCompletions(prev => {
      const next = { ...prev }
      for (const date in next) {
        next[date] = next[date].filter(id => id !== habitId)
        if (next[date].length === 0) delete next[date]
      }
      return next
    })
  }, [])

  const isCompleted = useCallback((habitId, date = today()) => {
    return (completions[date] || []).includes(habitId)
  }, [completions])

  return { habits, completions, toggleHabit, addHabit, deleteHabit, isCompleted }
}
