import { useEffect, useState } from 'react'

import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Stepper from '@/components/ui/Stepper'

import { clienteService } from '../services/clienteService'

import {
  validarCliente,
  montarPayloadCliente,
} from '../validations/clienteValidation'

const WIZARD_STEPS = [
  { id: 'cliente', label: 'Cliente' },
  { id: 'veiculo', label: 'Veículo' },
]

const TIPO_DOCUMENTO = [
  { label: 'CPF', value: 1 },
  { label: 'CNPJ', value: 2 },
]

const FORMULARIO_VAZIO = {
  nome: '',
  telefone: '',
  email: '',
  tipoDocumento: 1,
  documento: '',
  cep: '',
  logradouro: '',
  numero: '',
  complemento: '',
  bairro: '',
  cidade: '',
  estado: '',
}

function aplicarMaskTelefone(valor) {
  const digits = valor.replace(/\D/g, '').slice(0, 11)

  if (digits.length <= 10) {
    return digits
      .replace(/^(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2')
  }

  return digits
    .replace(/^(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
}

function aplicarMaskCPF(valor) {
  return valor.replace(/\D/g, '').slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
}

function aplicarMaskCNPJ(valor) {
  return valor.replace(/\D/g, '').slice(0, 14)
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d{1,2})$/, '$1-$2')
}

function aplicarMaskCEP(valor) {
  return valor.replace(/\D/g, '').slice(0, 8)
    .replace(/(\d{5})(\d)/, '$1-$2')
}

function aplicarMask(campo, valor, tipoDocumento) {
  if (campo === 'telefone') return aplicarMaskTelefone(valor)
  if (campo === 'cep') return aplicarMaskCEP(valor)

  if (campo === 'documento') {
    return tipoDocumento === 1
      ? aplicarMaskCPF(valor)
      : aplicarMaskCNPJ(valor)
  }

  return valor
}

function obterMensagemErro(data) {
  if (typeof data === 'string') return data
  if (data?.errors) return Object.values(data.errors).flat().join('\n')
  if (data?.title) return data.title
  return 'Erro ao salvar cliente.'
}

export default function ClienteModal({
  aberto,
  onFechar,
  clienteEdicao,
  onSucesso,
  onAvancar,
}) {
  const [formulario, setFormulario] = useState(FORMULARIO_VAZIO)
  const [erros, setErros] = useState({})
  const [salvando, setSalvando] = useState(false)
  const [mensagemErro, setMensagemErro] = useState(null)
  const [verificandoDoc, setVerificandoDoc] = useState(false)

  const editando = Boolean(clienteEdicao)

  useEffect(() => {
    if (editando) {
      setFormulario({
        nome: clienteEdicao.nome ?? '',
        telefone: clienteEdicao.telefone ?? '',
        email: clienteEdicao.email ?? '',
        tipoDocumento: clienteEdicao.tipoDocumento ?? 1,
        documento: clienteEdicao.documento ?? '',
        cep: clienteEdicao.cep ?? '',
        logradouro: clienteEdicao.logradouro ?? '',
        numero: clienteEdicao.numero ?? '',
        complemento: clienteEdicao.complemento ?? '',
        bairro: clienteEdicao.bairro ?? '',
        cidade: clienteEdicao.cidade ?? '',
        estado: clienteEdicao.estado ?? '',
      })
    } else {
      setFormulario(FORMULARIO_VAZIO)
    }

    setErros({})
    setMensagemErro(null)
  }, [aberto, editando, clienteEdicao])

  function alterarCampo(e) {
    const { name, value } = e.target

    let valorFinal = value

    if (name === 'tipoDocumento') {
      setFormulario((ant) => ({
        ...ant,
        tipoDocumento: Number(value),
        documento: '',
      }))

      setErros((ant) => ({
        ...ant,
        tipoDocumento: null,
        documento: null,
      }))

      return
    }

    const camposMask = ['telefone', 'cep', 'documento']

    if (camposMask.includes(name)) {
      valorFinal = aplicarMask(
        name,
        value,
        formulario.tipoDocumento
      )
    }

    if (name === 'estado') {
      valorFinal = value
        .replace(/[^a-zA-Z]/g, '')
        .toUpperCase()
        .slice(0, 2)
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

  async function verificarDocumento() {
    const doc = formulario.documento.replace(/\D/g, '')

    if (
      !doc ||
      (
        editando &&
        clienteEdicao.documento?.replace(/\D/g, '') === doc
      )
    ) {
      return
    }

    setVerificandoDoc(true)

    try {
      const todos = await clienteService.listar()

      const jaExiste = todos.some(
        (c) =>
          c.documento?.replace(/\D/g, '') === doc &&
          c.id !== clienteEdicao?.id
      )

      if (jaExiste) {
        setErros((ant) => ({
          ...ant,
          documento: 'Documento já cadastrado para outro cliente',
        }))
      }
    } catch {
    } finally {
      setVerificandoDoc(false)
    }
  }

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
      if (editando) {
        await clienteService.atualizar(
          clienteEdicao.id,
          payload
        )

        onSucesso()
        onFechar()
      } else {
        const clienteCriado = await clienteService.criar(payload)

        if (onAvancar) {
          onAvancar(clienteCriado)
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

  const placeholderDocumento =
    formulario.tipoDocumento === 1
      ? '000.000.000-00'
      : '00.000.000/0000-00'

  return (
    <Modal
      aberto={aberto}
      onFechar={onFechar}
      titulo={
        editando
          ? '// EDITAR CLIENTE'
          : '// NOVO CLIENTE'
      }
      subtitulo="N-OS"
      badge={
        editando
          ? `#${String(clienteEdicao.id).padStart(4, '0')}`
          : undefined
      }
      size="md"
    >
      <Modal.Body>

        {!editando && (
          <div className="mb-4 border border-(--nos-border) bg-(--nos-surface) px-4 py-3">
            <Stepper
              steps={WIZARD_STEPS}
              currentStep="cliente"
              completedSteps={[]}
            />
          </div>
        )}

        <Input
          label="// NOME"
          name="nome"
          value={formulario.nome}
          onChange={alterarCampo}
          placeholder="Nome completo"
          error={erros.nome}
          required
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="// TELEFONE"
            name="telefone"
            value={formulario.telefone}
            onChange={alterarCampo}
            placeholder="(00) 00000-0000"
            error={erros.telefone}
            required
          />

          <Input
            label="// E-MAIL"
            name="email"
            type="email"
            value={formulario.email}
            onChange={alterarCampo}
            placeholder="email@exemplo.com"
            error={erros.email}
          />
        </div>

        <div className="grid grid-cols-[110px_1fr] gap-3">
          <div>
            <label className="mb-1 block font-mono text-[10px] uppercase tracking-[0.15em] text-(--nos-text-muted)">
              // TIPO DOC.
              <span className="ml-1 text-(--nos-red)">*</span>
            </label>

            <select
              name="tipoDocumento"
              value={formulario.tipoDocumento}
              onChange={alterarCampo}
              className="w-full border border-(--nos-border-2) bg-(--nos-surface) px-3 py-2 font-mono text-xs text-(--nos-text) focus:border-(--nos-red) focus:outline-none"
            >
              {TIPO_DOCUMENTO.map((tipo) => (
                <option
                  key={tipo.value}
                  value={tipo.value}
                >
                  {tipo.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block font-mono text-[10px] uppercase tracking-[0.15em] text-(--nos-text-muted)">
              // DOCUMENTO
              <span className="ml-1 text-(--nos-red)">*</span>
            </label>

            <input
              name="documento"
              value={formulario.documento}
              onChange={alterarCampo}
              onBlur={verificarDocumento}
              placeholder={placeholderDocumento}
              className={[
                'w-full border bg-(--nos-surface) px-3 py-2 font-mono text-xs text-(--nos-text) focus:outline-none',
                erros.documento
                  ? 'border-(--nos-red) focus:border-(--nos-red)'
                  : 'border-(--nos-border-2) focus:border-(--nos-red)',
              ].join(' ')}
            />

            {verificandoDoc && (
              <p className="mt-1 text-[10px] text-(--nos-text-muted)">
                Verificando...
              </p>
            )}

            {erros.documento && (
              <p className="mt-1 text-[11px] text-(--nos-red)">
                {erros.documento}
              </p>
            )}
          </div>
        </div>

        <p className="mt-4 mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-(--nos-text-faint)">
          // endereço
          <span className="ml-1 text-(--nos-red)">*</span>
        </p>

        <div className="grid grid-cols-[110px_1fr] gap-3">
          <Input
            label="// CEP"
            name="cep"
            value={formulario.cep}
            onChange={alterarCampo}
            placeholder="00000-000"
            error={erros.cep}
            required
          />

          <Input
            label="// LOGRADOURO"
            name="logradouro"
            value={formulario.logradouro}
            onChange={alterarCampo}
            placeholder="Rua, Avenida..."
            error={erros.logradouro}
            required
          />
        </div>

        <div className="grid grid-cols-[70px_1fr_1fr] gap-3">
          <Input
            label="// Nº"
            name="numero"
            value={formulario.numero}
            onChange={alterarCampo}
            placeholder="123"
            error={erros.numero}
            required
          />

          <Input
            label="// BAIRRO"
            name="bairro"
            value={formulario.bairro}
            onChange={alterarCampo}
            placeholder="Bairro"
            error={erros.bairro}
            required
          />

          <Input
            label="// COMPLEMENTO"
            name="complemento"
            value={formulario.complemento}
            onChange={alterarCampo}
            placeholder="Apto, Sala..."
          />
        </div>

        <div className="grid grid-cols-[1fr_60px] gap-3">
          <Input
            label="// CIDADE"
            name="cidade"
            value={formulario.cidade}
            onChange={alterarCampo}
            placeholder="Cidade"
            error={erros.cidade}
            required
          />

          <Input
            label="// UF"
            name="estado"
            value={formulario.estado}
            onChange={alterarCampo}
            placeholder="PR"
            error={erros.estado}
            required
          />
        </div>

        {mensagemErro && (
          <div className="border border-(--nos-red-border) bg-(--nos-red-dim) px-4 py-2">
            {mensagemErro.split('\n').map((msg, i) => (
              <p
                key={i}
                className="font-mono text-xs text-(--nos-red)"
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
            : onAvancar
              ? 'Avançar →'
              : '+ Cadastrar'}
        </Button>
      </Modal.Footer>

    </Modal>
  )
}