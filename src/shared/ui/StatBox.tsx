interface StatBoxProps {
  value: number
  label: string
}

export function StatBox({ value, label }: StatBoxProps) {
  return (
    <div
      className="flex-1 rounded-[10px] px-3 py-2.5"
      style={{ background: 'rgba(255,255,255,.04)', border: '1px solid var(--gb)' }}
    >
      <div className="text-[19px] font-black tabular-nums" style={{ letterSpacing: '-.02em' }}>{value}</div>
      <div className="text-[11px] font-bold mt-px" style={{ color: 'var(--muted)' }}>{label}</div>
    </div>
  )
}
