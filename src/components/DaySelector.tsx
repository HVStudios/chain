import { useEffect, useRef } from 'react'
import type { Habit, CompletionMap } from '../types'
import { subtractDays, today } from '../utils/dateUtils'

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

interface Props {
  selectedDate: string
  onSelect: (date: string) => void
  completions: CompletionMap
  habits: Habit[]
}

export default function DaySelector({ selectedDate, onSelect, completions, habits }: Props) {
  const todayStr = today()
  const scrollRef = useRef<HTMLDivElement>(null)
  const selectedRef = useRef<HTMLButtonElement>(null)

  // Generate last 30 days, oldest first
  const days = Array.from({ length: 30 }, (_, i) => subtractDays(todayStr, 29 - i))

  useEffect(() => {
    // Scroll so the selected day is visible (centered if possible)
    selectedRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
  }, [selectedDate])

  function completionLevel(date: string): 'none' | 'partial' | 'full' {
    if (habits.length === 0) return 'none'
    const done = (completions[date] ?? []).length
    if (done === 0) return 'none'
    if (done >= habits.length) return 'full'
    return 'partial'
  }

  return (
    <div className="day-selector-wrap" ref={scrollRef}>
      {days.map(date => {
        const d = new Date(date + 'T00:00:00')
        const isToday = date === todayStr
        const isSelected = date === selectedDate
        const level = completionLevel(date)

        return (
          <button
            key={date}
            ref={isSelected ? selectedRef : undefined}
            className={[
              'day-btn',
              isSelected ? 'active' : '',
              isToday && !isSelected ? 'is-today' : '',
            ].filter(Boolean).join(' ')}
            onClick={() => onSelect(date)}
          >
            <span className="day-btn-name">{DAY_LABELS[d.getDay()]}</span>
            <span className="day-btn-num">{d.getDate()}</span>
            <span className={`day-btn-dot dot-${level}`} />
          </button>
        )
      })}
    </div>
  )
}
