import { Modal, ModalButtons } from './Modal'

interface ConfirmModalProps {
  open: boolean
  message: string
  onConfirm: () => void
  onCancel: () => void
  danger?: boolean
  confirmText?: string
  cancelText?: string
}

export function ConfirmModal({
  open, message, onConfirm, onCancel,
  danger = true, confirmText = 'Удалить', cancelText = 'Отмена',
}: ConfirmModalProps) {
  return (
    <Modal open={open} onClose={onCancel}>
      <div className="text-center text-[14px] leading-relaxed py-3 px-1">{message}</div>
      <ModalButtons
        onCancel={onCancel}
        onConfirm={onConfirm}
        cancelText={cancelText}
        confirmText={confirmText}
        danger={danger}
      />
    </Modal>
  )
}
