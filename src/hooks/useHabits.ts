import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'
import { today } from '../utils/dateUtils'
import type { Habit, CompletionMap } from '../types'

export function useHabits(userId: string) {
  const [habits, setHabits] = useState<Habit[]>([])
  const [completions, setCompletions] = useState<CompletionMap>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function loadData() {
      setLoading(true)

      const [{ data: habitsData }, { data: completionsData }] = await Promise.all([
        supabase.from('habits').select('*').eq('user_id', userId).order('created_at'),
        supabase.from('completions').select('habit_id, completed_date').eq('user_id', userId),
      ])

      if (cancelled) return

      setHabits((habitsData ?? []) as Habit[])

      const map: CompletionMap = {}
      for (const row of completionsData ?? []) {
        const date = row.completed_date as string
        if (!map[date]) map[date] = []
        map[date].push(row.habit_id as string)
      }
      setCompletions(map)
      setLoading(false)
    }

    loadData()
    return () => { cancelled = true }
  }, [userId])

  const toggleHabit = useCallback(
    async (habitId: string, date = today()) => {
      const isDone = (completions[date] ?? []).includes(habitId)

      // Optimistic update
      setCompletions(prev => ({
        ...prev,
        [date]: isDone
          ? (prev[date] ?? []).filter(id => id !== habitId)
          : [...(prev[date] ?? []), habitId],
      }))

      if (isDone) {
        await supabase
          .from('completions')
          .delete()
          .eq('user_id', userId)
          .eq('habit_id', habitId)
          .eq('completed_date', date)
      } else {
        await supabase.from('completions').insert({
          user_id: userId,
          habit_id: habitId,
          completed_date: date,
        })
      }
    },
    [completions, userId],
  )

  const addHabit = useCallback(
    async (name: string, emoji: string, color: string, frequency: number) => {
      const { data, error } = await supabase
        .from('habits')
        .insert({ user_id: userId, name, emoji, color, frequency, created_at: today() })
        .select()
        .single()

      if (!error && data) {
        setHabits(prev => [...prev, data as Habit])
      }
    },
    [userId],
  )

  const deleteHabit = useCallback(
    async (habitId: string) => {
      setHabits(prev => prev.filter(h => h.id !== habitId))
      setCompletions(prev => {
        const next = { ...prev }
        for (const date in next) {
          next[date] = next[date].filter(id => id !== habitId)
          if (next[date].length === 0) delete next[date]
        }
        return next
      })
      await supabase.from('habits').delete().eq('id', habitId).eq('user_id', userId)
    },
    [userId],
  )

  const isCompleted = useCallback(
    (habitId: string, date = today()) => (completions[date] ?? []).includes(habitId),
    [completions],
  )

  return { habits, completions, loading, toggleHabit, addHabit, deleteHabit, isCompleted }
}
