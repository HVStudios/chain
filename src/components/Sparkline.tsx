interface Props {
  data: number[]  // 1 = done, 0 = missed
  color: string
}

export default function Sparkline({ data, color }: Props) {
  return (
    <div className="sparkline" aria-hidden>
      {data.map((v, i) => (
        <span
          key={i}
          className="spark-cell"
          style={v ? { background: color, boxShadow: `0 0 4px ${color}66` } : undefined}
        />
      ))}
    </div>
  )
}
