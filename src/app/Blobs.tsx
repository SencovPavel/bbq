export function Blobs() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div
        className="absolute rounded-full blob-glow-tl"
        style={{
          width: 420,
          height: 420,
          top: -140,
          left: -100,
          background: 'var(--glow-fire)',
        }}
      />
      <div
        className="absolute rounded-full"
        style={{
          width: 300,
          height: 300,
          bottom: 20,
          right: -80,
          background: 'var(--glow-amber)',
        }}
      />
      <div
        className="absolute rounded-full"
        style={{
          width: 260,
          height: 260,
          top: '45%',
          left: '10%',
          background: 'var(--glow-ember)',
        }}
      />
    </div>
  )
}
