export function toDateString(date: Date): string {
  return date.toISOString().slice(0, 10)
}

export function today(): string {
  return toDateString(new Date())
}

export function subtractDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T00:00:00')
  d.setDate(d.getDate() - days)
  return toDateString(d)
}

export function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T00:00:00')
  d.setDate(d.getDate() + days)
  return toDateString(d)
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

export function getDayOfWeek(dateStr: string): number {
  return new Date(dateStr + 'T00:00:00').getDay()
}
