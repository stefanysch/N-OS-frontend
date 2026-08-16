import { useEffect, useState } from 'react'

import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Stepper from '@/components/ui/Stepper'

import { veiculoService } from '../services/veiculoService'
import { clienteService } from '@/features/clientes/services/clienteService'

import {
  validarVeiculo,
  montarPayloadVeiculo,
} from '../validations/veiculoValidation'

const WIZARD_STEPS = [
  { id: 'cliente', label: 'Cliente' },
  { id: 'veiculo', label: 'Veículo' },
]

const FORMULARIO_VAZIO = {
  clienteId: '',
  placa: '',
  marca: '',
  modelo: '',
  ano: '',
  cor: '',
  chassi: '',
}

function aplicarMaskPlaca(valor) {
  const raw = valor
    .replace(/[^a-zA-Z0-9]/g, '')
    .toUpperCase()
    .slice(0, 7)

  if (raw.length <= 3) return raw

  return raw.slice(0, 3) + '-' + raw.slice(3)
}

function aplicarMaskAno(valor) {
  return valor.replace(/\D/g, '').slice(0, 4)
}

function obterMensagemErro(data) {
  if (typeof data === 'string') return data
  if (data?.errors) return Object.values(data.errors).flat().join('\n')
  if (data?.title) return data.title
  return 'Erro ao salvar veículo.'
}

export default function VeiculoModal({
  aberto,
  onFechar,
  veiculoEdicao,
  clienteWizard,
  onSucesso,
  onConcluir,
}) {
  const [formulario, setFormulario] = useState(FORMULARIO_VAZIO)
  const [clientes, setClientes] = useState([])
  const [erros, setErros] = useState({})
  const [salvando, setSalvando] = useState(false)
  const [mensagemErro, setMensagemErro] = useState(null)

  const editando = Boolean(veiculoEdicao)
  const modoWizard = Boolean(clienteWizard)

  useEffect(() => {
    if (modoWizard) return

    clienteService
      .listar()
      .then((d) =>
        setClientes(
          Array.isArray(d)
            ? d.filter((c) => c.ativo)
            : []
        )
      )
      .catch(() => setClientes([]))
  }, [modoWizard])

  useEffect(() => {
    if (editando) {
      setFormulario({
        clienteId: veiculoEdicao.clienteId ?? '',
        placa: veiculoEdicao.placa ?? '',
        marca: veiculoEdicao.marca ?? '',
        modelo: veiculoEdicao.modelo ?? '',
        ano: String(veiculoEdicao.ano ?? ''),
        cor: veiculoEdicao.cor ?? '',
        chassi: veiculoEdicao.chassi ?? '',
      })
    } else {
      setFormulario(FORMULARIO_VAZIO)
    }

    setErros({})
    setMensagemErro(null)
  }, [aberto, editando, veiculoEdicao])

  function alterarCampo(e) {
    const { name, value } = e.target

    let valorFinal = value

    if (name === 'placa') {
      valorFinal = aplicarMaskPlaca(value)
    }

    if (name === 'ano') {
      valorFinal = aplicarMaskAno(value)
    }

    setFormulario((ant) => ({
      ...ant,
      [name]: valorFinal,
    }))

    if (erros[name]) {
      setErros((ant) => ({
        ...ant,
        [name]: null,
      }))
    }
  }

  async function salvar(e) {
    e.preventDefault()

    const errosValidacao = validarVeiculo(formulario, { modoWizard })

    if (Object.keys(errosValidacao).length > 0) {
      setErros(errosValidacao)
      return
    }

    setSalvando(true)
    setMensagemErro(null)

    const payload = montarPayloadVeiculo(formulario, { modoWizard, clienteWizard })

    try {
      if (editando) {
        await veiculoService.atualizar(
          veiculoEdicao.id,
          payload
        )

        onSucesso()
        onFechar()
      } else {
        const veiculoCriado =
          await veiculoService.criar(payload)

        if (onConcluir) {
          onConcluir({
            cliente: clienteWizard,
            veiculo: veiculoCriado,
          })
        } else {
          onSucesso()
          onFechar()
        }
      }
    } catch (erro) {
      setMensagemErro(
        obterMensagemErro(erro?.response?.data)
      )
    } finally {
      setSalvando(false)
    }
  }

  return (
    <Modal
      aberto={aberto}
      onFechar={onFechar}
      titulo={
        editando
          ? '// EDITAR VEÍCULO'
          : '// NOVO VEÍCULO'
      }
      subtitulo="N-OS"
      badge={
        editando
          ? `#${String(veiculoEdicao.id).padStart(4, '0')}`
          : undefined
      }
      size="md"
    >
      <Modal.Body>

        {!editando && (
          <div className="mb-5 border border-(--nos-border) bg-(--nos-surface) px-4 py-3">
            <Stepper
              steps={WIZARD_STEPS}
              currentStep="veiculo"
              completedSteps={
                modoWizard
                  ? ['cliente']
                  : []
              }
            />
          </div>
        )}

        {modoWizard && !editando ? (
          <div className="mb-4 flex items-center gap-3 border border-(--nos-success)/20 bg-(--nos-success)/5 px-3 py-2">

            <span className="font-data text-[10px] uppercase tracking-widest text-(--nos-success)/60">
              // cliente
            </span>

            <span className="font-data text-xs text-(--nos-success)">
              {clienteWizard.nome}
            </span>

            <span className="ml-auto font-data text-[10px] text-(--nos-success)/40">
              #{String(clienteWizard.id).padStart(4, '0')}
            </span>

          </div>
        ) : !editando ? (
          <div className="mb-4">

            <label className="mb-1 block font-data text-[10px] uppercase tracking-[0.15em] text-(--nos-text-muted)">
              // CLIENTE
              <span className="ml-1 text-(--nos-red)">*</span>
            </label>

            <select
              name="clienteId"
              value={formulario.clienteId}
              onChange={alterarCampo}
              className={[
                'w-full border bg-(--nos-surface) px-3 py-2 font-data text-xs text-(--nos-text) focus:outline-none',
                erros.clienteId
                  ? 'border-(--nos-red) focus:border-(--nos-red)'
                  : 'border-(--nos-border-2) focus:border-(--nos-red)',
              ].join(' ')}
            >
              <option value="">
                Selecione um cliente...
              </option>

              {clientes.map((c) => (
                <option
                  key={c.id}
                  value={c.id}
                >
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
        ) : null}

        <Input
          label="// PLACA"
          name="placa"
          value={formulario.placa}
          onChange={alterarCampo}
          placeholder="ABC-1234"
          error={erros.placa}
          required
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="// MARCA"
            name="marca"
            value={formulario.marca}
            onChange={alterarCampo}
            placeholder="Honda, Yamaha, Suzuki..."
            error={erros.marca}
            required
          />

          <Input
            label="// MODELO"
            name="modelo"
            value={formulario.modelo}
            onChange={alterarCampo}
            placeholder="CG 160, Factor 150..."
            error={erros.modelo}
            required
          />
        </div>

        <div className="grid grid-cols-[120px_1fr] gap-3">
          <Input
            label="// ANO"
            name="ano"
            value={formulario.ano}
            onChange={alterarCampo}
            placeholder="2024"
            error={erros.ano}
            required
          />

          <Input
            label="// COR"
            name="cor"
            value={formulario.cor}
            onChange={alterarCampo}
            placeholder="Preta, Vermelha... (opcional)"
            error={erros.cor}
          />
        </div>

        <Input
          label="// CHASSI"
          name="chassi"
          value={formulario.chassi}
          onChange={alterarCampo}
          placeholder="Opcional"
          error={erros.chassi}
        />

        {mensagemErro && (
          <div className="border border-(--nos-red-border) bg-(--nos-red-dim) px-4 py-2">
            {mensagemErro.split('\n').map((msg, i) => (
              <p
                key={i}
                className="font-data text-xs text-(--nos-red)"
              >
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
          variant={editando ? 'secondary' : 'primary'}
          type="submit"
          loading={salvando}
          onClick={salvar}
        >
          {editando
            ? 'Salvar alterações'
            : modoWizard
              ? 'Concluir e Abrir OS →'
              : '+ Cadastrar'}
        </Button>
      </Modal.Footer>

    </Modal>
  )
}