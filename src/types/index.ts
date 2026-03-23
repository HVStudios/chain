export interface Habit {
  id: string
  user_id: string
  name: string
  emoji: string
  color: string
  frequency: number  // times per week, 1–7; 7 = daily
  created_at: string
}

/** date string (YYYY-MM-DD) → array of completed habitIds */
export type CompletionMap = Record<string, string[]>
