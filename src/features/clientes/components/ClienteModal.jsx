import { useEffect, useState } from 'react'

import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import Stepper from '@/components/ui/Stepper'

import ClienteCampos from './ClienteCampos'

import { clienteService } from '../services/clienteService'
import { obterMensagemErro } from '@/utils/erros'

import {
  CLIENTE_FORMULARIO_VAZIO,
  validarCliente,
  montarPayloadCliente,
} from '../validations/clienteValidation'

const WIZARD_STEPS = [
  { id: 'cliente', label: 'Cliente' },
  { id: 'veiculo', label: 'Veículo' },
]

export default function ClienteModal({
  aberto,
  onFechar,
  onSucesso,
  onAvancar,
}) {
  const [formulario, setFormulario] = useState(CLIENTE_FORMULARIO_VAZIO)
  const [erros, setErros] = useState({})
  const [salvando, setSalvando] = useState(false)
  const [mensagemErro, setMensagemErro] = useState(null)

  useEffect(() => {
    setFormulario(CLIENTE_FORMULARIO_VAZIO)
    setErros({})
    setMensagemErro(null)
  }, [aberto])

  async function salvar(e) {
    e.preventDefault()

    const errosValidacao = validarCliente(formulario)

    if (Object.keys(errosValidacao).length > 0) {
      setErros(errosValidacao)
      return
    }

    if (erros.documento) return

    setSalvando(true)
    setMensagemErro(null)

    const payload = montarPayloadCliente(formulario)

    try {
      const clienteCriado = await clienteService.criar(payload)

      if (onAvancar) {
        onAvancar(clienteCriado)
      } else {
        onSucesso()
        onFechar()
      }
    } catch (erro) {
      setMensagemErro(
        obterMensagemErro(erro?.response?.data, 'Erro ao salvar cliente.')
      )
    } finally {
      setSalvando(false)
    }
  }

  return (
    <Modal
      aberto={aberto}
      onFechar={onFechar}
      titulo="// NOVO CLIENTE"
      subtitulo="N-OS"
      size="md"
    >
      <Modal.Body>

        <div className="mb-4 border border-(--nos-border) bg-(--nos-surface) px-4 py-3">
          <Stepper
            steps={WIZARD_STEPS}
            currentStep="cliente"
            completedSteps={[]}
          />
        </div>

        <ClienteCampos
          formulario={formulario}
          setFormulario={setFormulario}
          erros={erros}
          setErros={setErros}
        />

        {mensagemErro && (
          <div className="border border-(--nos-red-border) bg-(--nos-red-dim) px-4 py-2">
            {mensagemErro.split('\n').map((msg, i) => (
              <p key={i} className="font-mono text-xs text-(--nos-red)">
                {msg}
              </p>
            ))}
          </div>
        )}

      </Modal.Body>

      <Modal.Footer>
        <Button
          variant="ghost"
          onClick={onFechar}
          disabled={salvando}
        >
          Cancelar
        </Button>

        <Button
          variant="primary"
          type="submit"
          loading={salvando}
          onClick={salvar}
        >
          {onAvancar ? 'Avançar →' : '+ Cadastrar'}
        </Button>
      </Modal.Footer>

    </Modal>
  )
}
