import { useState } from 'react'

import { Modal } from '../Modal'
import { useToastStore } from '../../stores/toastStore'

interface ReceiptScannerProps {
  open: boolean
  onClose: () => void
  eventId: string | null
}

/**
 * Сканер чека: пока ручной ввод QR-строки ФНС.
 * Камера и сопоставление позиций — следующий этап.
 */
export function ReceiptScanner({ open, onClose }: ReceiptScannerProps) {
  const showToast = useToastStore(s => s.show)
  const [raw, setRaw] = useState('')

  const handleSubmit = () => {
    if (!raw.trim()) {
      showToast('Вставьте строку QR с чека', 'muted')
      return
    }
    showToast('Распознавание чека скоро будет доступно', 'info')
    onClose()
    setRaw('')
  }

  return (
    <Modal open={open} onClose={onClose} title="Сканировать чек">
      <p className="text-sm mb-3 leading-relaxed" style={{ color: 'var(--muted)' }}>
        Вставьте данные QR-кода с кассового чека (формат ФНС). Поддержка камеры и автосопоставления
        позиций появится в следующем обновлении.
      </p>
      <textarea
        value={raw}
        onChange={e => setRaw(e.target.value)}
        placeholder="t=20260530T1142&s=4280.00&fn=..."
        rows={4}
        className="glass-input w-full rounded-md p-3 text-sm mb-4 resize-none"
        style={{ fontFamily: 'inherit' }}
      />
      <button
        type="button"
        onClick={handleSubmit}
        className="w-full py-3 rounded-md border-none text-sm font-extrabold cursor-pointer"
        style={{ background: 'var(--accent)', color: 'var(--text-on-accent)', fontFamily: 'inherit' }}
      >
        Продолжить
      </button>
    </Modal>
  )
}
