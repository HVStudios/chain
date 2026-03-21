export interface Habit {
  id: string
  user_id: string
  name: string
  emoji: string
  color: string
  created_at: string
}

/** date string (YYYY-MM-DD) → array of completed habitIds */
export type CompletionMap = Record<string, string[]>
