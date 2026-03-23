import { useState, FormEvent } from 'react'

const COLORS = [
  '#6c63ff', '#f97316', '#38bdf8', '#4ade80',
  '#f43f5e', '#facc15', '#a78bfa', '#fb923c',
]

const EMOJIS = ['⚡', '🏃', '📚', '💧', '🧘', '🎯', '💪', '🥗', '😴', '✍️', '🎨', '🎵']

const FREQ_OPTIONS = [
  { value: 7, label: 'Daily' },
  { value: 5, label: '5×/wk' },
  { value: 4, label: '4×/wk' },
  { value: 3, label: '3×/wk' },
  { value: 2, label: '2×/wk' },
  { value: 1, label: '1×/wk' },
]

interface Props {
  onAdd: (name: string, emoji: string, color: string, frequency: number) => void
  onClose: () => void
}

export default function AddHabitModal({ onAdd, onClose }: Props) {
  const [name, setName] = useState('')
  const [emoji, setEmoji] = useState('⚡')
  const [color, setColor] = useState(COLORS[0])
  const [frequency, setFrequency] = useState(7)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    onAdd(name.trim(), emoji, color, frequency)
    onClose()
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>New Habit</h2>
          <button className="icon-btn" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Name</label>
            <input
              autoFocus
              type="text"
              placeholder="e.g. Morning walk"
              value={name}
              onChange={e => setName(e.target.value)}
              maxLength={40}
            />
          </div>

          <div className="field">
            <label>Frequency</label>
            <div className="freq-grid">
              {FREQ_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  className={`freq-btn${frequency === opt.value ? ' selected' : ''}`}
                  onClick={() => setFrequency(opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="field">
            <label>Icon</label>
            <div className="emoji-grid">
              {EMOJIS.map(e => (
                <button
                  key={e}
                  type="button"
                  className={`emoji-btn${emoji === e ? ' selected' : ''}`}
                  onClick={() => setEmoji(e)}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          <div className="field">
            <label>Color</label>
            <div className="color-grid">
              {COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  className={`color-swatch${color === c ? ' selected' : ''}`}
                  style={{ background: c }}
                  onClick={() => setColor(c)}
                />
              ))}
            </div>
          </div>

          <div className="modal-preview">
            <div className="habit-chip" style={{ borderColor: color }}>
              <span>{emoji}</span>
              <span>{name || 'Habit name'}</span>
            </div>
          </div>

          <button type="submit" className="btn-primary" disabled={!name.trim()}>
            Add Habit
          </button>
        </form>
      </div>
    </div>
  )
}
