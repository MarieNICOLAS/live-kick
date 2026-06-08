import type { ReactNode } from 'react'
import { Button } from './Button'

type ModalProps = {
  isOpen: boolean
  title: string
  children: ReactNode
  footer?: ReactNode
  onClose: () => void
}

export function Modal({ isOpen, title, children, footer, onClose }: ModalProps) {
  if (!isOpen) {
    return null
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <section className="modal-panel" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <header className="modal-header">
          <h2 id="modal-title">{title}</h2>
          <Button type="button" variant="ghost" onClick={onClose} aria-label="Fermer">
            Fermer
          </Button>
        </header>
        <div className="modal-content">{children}</div>
        {footer ? <footer className="modal-footer">{footer}</footer> : null}
      </section>
    </div>
  )
}
