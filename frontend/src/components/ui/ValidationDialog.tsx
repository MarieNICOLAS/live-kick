import { Button } from './Button'
import { Modal } from './Modal'

type ValidationDialogProps = {
  isOpen: boolean
  title?: string
  message: string
  confirmLabel?: string
  onConfirm: () => void
  onClose: () => void
}

export function ValidationDialog({
  isOpen,
  title = 'Validation',
  message,
  confirmLabel = 'Valider',
  onConfirm,
  onClose,
}: ValidationDialogProps) {
  return (
    <Modal
      isOpen={isOpen}
      title={title}
      onClose={onClose}
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onClose}>
            Annuler
          </Button>
          <Button type="button" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p>{message}</p>
    </Modal>
  )
}
