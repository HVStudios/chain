import { useState } from 'react'

const COLORS = [
  '#6c63ff', '#f97316', '#38bdf8', '#4ade80',
  '#f43f5e', '#facc15', '#a78bfa', '#fb923c',
]

const EMOJIS = ['⚡', '🏃', '📚', '💧', '🧘', '🎯', '💪', '🥗', '😴', '✍️', '🎨', '🎵']

export default function AddHabitModal({ onAdd, onClose }) {
  const [name, setName] = useState('')
  const [emoji, setEmoji] = useState('⚡')
  const [color, setColor] = useState(COLORS[0])

  function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) return
    onAdd(name.trim(), emoji, color)
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
