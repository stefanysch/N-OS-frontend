import { useEffect, useState } from 'react'

import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import Stepper from '@/components/ui/Stepper'

import VeiculoCampos from './VeiculoCampos'

import { veiculoService } from '../services/veiculoService'
import { clienteService } from '@/features/clientes/services/clienteService'
import { obterMensagemErro } from '@/utils/erros'

import {
  VEICULO_FORMULARIO_VAZIO,
  validarVeiculo,
  montarPayloadVeiculo,
} from '../validations/veiculoValidation'

const WIZARD_STEPS = [
  { id: 'cliente', label: 'Cliente' },
  { id: 'veiculo', label: 'Veículo' },
]

export default function VeiculoModal({
  aberto,
  onFechar,
  clienteWizard,
  clienteFixo,
  onSucesso,
  onConcluir,
}) {
  const [formulario, setFormulario] = useState(VEICULO_FORMULARIO_VAZIO)
  const [clientes, setClientes] = useState([])
  const [erros, setErros] = useState({})
  const [salvando, setSalvando] = useState(false)
  const [mensagemErro, setMensagemErro] = useState(null)
  const modoWizard = Boolean(clienteWizard)
  // cliente já definido: vindo do wizard ou da tela de detalhes do cliente
  const clienteDefinido = clienteWizard ?? clienteFixo ?? null

  useEffect(() => {
    if (clienteDefinido) return

    clienteService
      .listar()
      .then((d) =>
        setClientes(Array.isArray(d) ? d.filter((c) => c.ativo) : [])
      )
      .catch(() => setClientes([]))
  }, [clienteDefinido])

  useEffect(() => {
    setFormulario(VEICULO_FORMULARIO_VAZIO)
    setErros({})
    setMensagemErro(null)
  }, [aberto])

  function alterarCliente(e) {
    setFormulario((ant) => ({ ...ant, clienteId: e.target.value }))

    if (erros.clienteId) {
      setErros((ant) => ({ ...ant, clienteId: null }))
    }
  }

  async function salvar(e) {
    e.preventDefault()

    const errosValidacao = validarVeiculo(formulario, { exigirCliente: !clienteDefinido })

    if (Object.keys(errosValidacao).length > 0) {
      setErros(errosValidacao)
      return
    }

    setSalvando(true)
    setMensagemErro(null)

    const payload = {
      clienteId: clienteDefinido ? clienteDefinido.id : Number(formulario.clienteId),
      ...montarPayloadVeiculo(formulario),
    }

    try {
      const veiculoCriado = await veiculoService.criar(payload)

      if (onConcluir) {
        onConcluir({
          cliente: clienteWizard,
          veiculo: veiculoCriado,
        })
      } else {
        onSucesso()
        onFechar()
      }
    } catch (erro) {
      setMensagemErro(
        obterMensagemErro(erro?.response?.data, 'Erro ao salvar veículo.')
      )
    } finally {
      setSalvando(false)
    }
  }

  return (
    <Modal
      aberto={aberto}
      onFechar={onFechar}
      titulo="// NOVO VEÍCULO"
      subtitulo="N-OS"
      size="md"
    >
      <Modal.Body>

        {modoWizard && (
          <div className="mb-5 border border-(--nos-border) bg-(--nos-surface) px-4 py-3">
            <Stepper
              steps={WIZARD_STEPS}
              currentStep="veiculo"
              completedSteps={['cliente']}
            />
          </div>
        )}

        {clienteDefinido ? (
          <div className="mb-4 flex items-center gap-3 border border-(--nos-success)/20 bg-(--nos-success)/5 px-3 py-2">

            <span className="font-data text-[10px] uppercase tracking-widest text-(--nos-success)/60">
              // cliente
            </span>

            <span className="font-data text-xs text-(--nos-success)">
              {clienteDefinido.nome}
            </span>

            <span className="ml-auto font-data text-[10px] text-(--nos-success)/40">
              #{String(clienteDefinido.id).padStart(4, '0')}
            </span>

          </div>
        ) : (
          <div className="mb-4">

            <label className="mb-1 block font-data text-[10px] uppercase tracking-[0.15em] text-(--nos-text-muted)">
              // CLIENTE
              <span className="ml-1 text-(--nos-red)">*</span>
            </label>

            <select
              name="clienteId"
              value={formulario.clienteId}
              onChange={alterarCliente}
              className={[
                'w-full border bg-(--nos-surface) px-3 py-2 font-data text-xs text-(--nos-text) focus:outline-none',
                erros.clienteId
                  ? 'border-(--nos-red) focus:border-(--nos-red)'
                  : 'border-(--nos-border-2) focus:border-(--nos-red)',
              ].join(' ')}
            >
              <option value="">Selecione um cliente...</option>

              {clientes.map((c) => (
                <option key={c.id} value={c.id}>
                  #{String(c.id).padStart(4, '0')} — {c.nome}
                </option>
              ))}
            </select>

            {erros.clienteId && (
              <p className="mt-1 text-[11px] text-(--nos-red)">
                {erros.clienteId}
              </p>
            )}

          </div>
        )}

        <VeiculoCampos
          formulario={formulario}
          setFormulario={setFormulario}
          erros={erros}
          setErros={setErros}
        />

        {mensagemErro && (
          <div className="border border-(--nos-red-border) bg-(--nos-red-dim) px-4 py-2">
            {mensagemErro.split('\n').map((msg, i) => (
              <p key={i} className="font-data text-xs text-(--nos-red)">
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
          {modoWizard ? 'Concluir e Abrir OS →' : '+ Cadastrar'}
        </Button>
      </Modal.Footer>

    </Modal>
  )
}
