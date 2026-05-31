interface ReceiptFABProps {
  onClick: () => void
}

export function ReceiptFAB({ onClick }: ReceiptFABProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Сканировать чек"
      className="fixed z-[45] flex items-center justify-center border-none cursor-pointer
                 lg:bottom-8 lg:right-8 bottom-[calc(100px+env(safe-area-inset-bottom))] right-4"
      style={{
        width: 54,
        height: 54,
        borderRadius: 16,
        background: 'var(--gradient-brand)',
        boxShadow: '0 8px 28px var(--shadow-brand-md)',
        fontFamily: 'inherit',
      }}
    >
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <path d="M14 14h2v2h-2zM18 14h3v3h-3zM14 18h2v3h-2zM18 18h3v3h-3z" fill="#fff" stroke="none" />
      </svg>
    </button>
  )
}
