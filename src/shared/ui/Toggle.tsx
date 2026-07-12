interface ToggleProps {
  on: boolean
  onToggle: () => void
}

export function Toggle({ on, onToggle }: ToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="relative border-none cursor-pointer transition-colors duration-200 shrink-0"
      style={{
        width: 40,
        height: 22,
        borderRadius: 11,
        background: on ? 'var(--accent)' : 'var(--surface-white-10)',
      }}
      aria-pressed={on}
    >
      <span
        className="absolute top-[3px] rounded-full transition-all duration-200"
        style={{
          width: 16,
          height: 16,
          background: 'var(--color-white)',
          left: on ? 'calc(100% - 19px)' : 3,
        }}
      />
    </button>
  )
}
