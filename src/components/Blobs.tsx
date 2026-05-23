export function Blobs() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="absolute rounded-full"
        style={{ width: 380, height: 380, top: -100, left: -80,
          background: 'radial-gradient(circle,rgba(255,90,40,0.38),transparent 70%)' }} />
      <div className="absolute rounded-full"
        style={{ width: 320, height: 320, bottom: 40, right: -80,
          background: 'radial-gradient(circle,rgba(120,40,220,0.32),transparent 70%)' }} />
      <div className="absolute rounded-full"
        style={{ width: 240, height: 240, top: '42%', left: '18%',
          background: 'radial-gradient(circle,rgba(14,165,233,0.22),transparent 70%)' }} />
    </div>
  )
}
