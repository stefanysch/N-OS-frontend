import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'

export default function ModalErro({ aberto, mensagem, onFechar }) {
  return (
    <Modal
      aberto={aberto}
      onFechar={onFechar}
      titulo="// ERRO ¯(°_o)/¯"
      subtitulo="N-OS"
      size="sm"
    >
      <Modal.Body>
        <div className="border border-(--nos-red-border) bg-(--nos-red-dim) px-4 py-3">
          {mensagem?.split('\n').map((linha, i) => (
            <p key={i} className="font-mono text-xs text-(--nos-red)">
              {linha}
            </p>
          ))}
        </div>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onFechar}>
          Fechar
        </Button>
      </Modal.Footer>
    </Modal>
  )
}
