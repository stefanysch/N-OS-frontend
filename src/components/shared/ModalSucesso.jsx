import { useEffect, useState } from 'react'

import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import { inscreverNotificacoes } from '@/utils/notificacoes'

export default function ModalSucesso() {
  const [mensagem, setMensagem] = useState(null)

  useEffect(() => inscreverNotificacoes(setMensagem), [])

  function fechar() {
    setMensagem(null)
  }

  return (
    <Modal
      aberto={Boolean(mensagem)}
      onFechar={fechar}
      titulo="// SUCESSO !!"
      subtitulo="N-OS"
      size="sm"
    >
      <Modal.Body>
        <div className="border border-(--nos-success)/40 bg-(--nos-success)/5 px-4 py-3">
          <p className="font-mono text-xs text-(--nos-success)">
            {mensagem}
          </p>
        </div>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={fechar}>
          Fechar
        </Button>
      </Modal.Footer>
    </Modal>
  )
}
