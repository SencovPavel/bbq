export function Blobs() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* тёплый оранжевый — костёр сверху */}
      <div className="absolute rounded-full"
        style={{ width: 420, height: 420, top: -140, left: -100,
          background: 'radial-gradient(circle,rgba(249,115,22,0.28),transparent 65%)' }} />
      {/* янтарный — снизу-справа */}
      <div className="absolute rounded-full"
        style={{ width: 300, height: 300, bottom: 20, right: -80,
          background: 'radial-gradient(circle,rgba(251,191,36,0.18),transparent 65%)' }} />
      {/* глубокий коричневый — середина */}
      <div className="absolute rounded-full"
        style={{ width: 260, height: 260, top: '45%', left: '10%',
          background: 'radial-gradient(circle,rgba(120,53,15,0.25),transparent 70%)' }} />
    </div>
  )
}
