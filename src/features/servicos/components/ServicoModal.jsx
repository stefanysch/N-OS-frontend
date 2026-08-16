import { useEffect, useState } from 'react'

import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'

import { servicoService } from '../services/servicoService'

import {
  validarServico,
  montarPayloadServico
} from '../validations/servicoValidation'

const FORMULARIO_VAZIO = {
  nome: '',
  descricao: '',
  valor: ''
}

function obterMensagemErro(data) {
  if (typeof data === 'string') {
    return data
  }

  if (data?.errors) {
    return Object.values(data.errors)
      .flat()
      .join('\n')
  }

  if (data?.title) {
    return data.title
  }

  return 'Erro ao salvar serviço.'
}

export default function ServicoModal({
  aberto,
  onFechar,
  servicoEdicao,
  onSucesso
}) {
  const [formulario, setFormulario] =
    useState(FORMULARIO_VAZIO)

  const [erros, setErros] =
    useState({})

  const [salvando, setSalvando] =
    useState(false)

  const [mensagemErro, setMensagemErro] =
    useState(null)

  const editando = Boolean(servicoEdicao)

  useEffect(() => {
    if (editando) {
      setFormulario({
        nome: servicoEdicao.nome ?? '',
        descricao: servicoEdicao.descricao ?? '',
        valor: servicoEdicao.valor ?? ''
      })
    } else {
      setFormulario(FORMULARIO_VAZIO)
    }

    setErros({})
    setMensagemErro(null)
  }, [aberto, servicoEdicao, editando])

  function alterarCampo(evento) {
    const { name, value } = evento.target

    setFormulario((anterior) => ({
      ...anterior,
      [name]: value
    }))

    if (!erros[name]) {
      return
    }

    setErros((anterior) => ({
      ...anterior,
      [name]: null
    }))
  }

  async function salvar(evento) {
    evento.preventDefault()

    const errosValidacao =
      validarServico(formulario)

    if (Object.keys(errosValidacao).length > 0) {
      setErros(errosValidacao)
      return
    }

    setSalvando(true)
    setMensagemErro(null)

    const payload =
      montarPayloadServico(formulario)

    try {
      if (editando) {
        await servicoService.atualizar(
          servicoEdicao.id,
          payload
        )
      } else {
        await servicoService.criar(payload)
      }

      onSucesso()
      onFechar()

    } catch (erro) {

      setMensagemErro(
        obterMensagemErro(
          erro?.response?.data
        )
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
          ? '// EDITAR SERVIÇO'
          : '// NOVO SERVIÇO'
      }
      subtitulo="N-OS"
      badge={
        editando
          ? `#${String(servicoEdicao.id).padStart(4, '0')}`
          : undefined
      }
      size="md"
    >
      <Modal.Body>

        <Input
          label="// NOME"
          name="nome"
          value={formulario.nome}
          onChange={alterarCampo}
          placeholder="Ex: Troca de óleo"
          required
          error={erros.nome}
        />

        <Input
          label="// DESCRIÇÃO"
          name="descricao"
          as="textarea"
          rows={2}
          value={formulario.descricao}
          onChange={alterarCampo}
          placeholder="Descrição técnica do serviço"
          error={erros.descricao}
        />

        <Input
          label="// VALOR (R$)"
          name="valor"
          type="number"
          step="0.01"
          min="0"
          value={formulario.valor}
          onChange={alterarCampo}
          placeholder="0,00"
          required
          error={erros.valor}
        />

        {mensagemErro && (
          <div className="border border-(--nos-red-border) bg-(--nos-red-dim) px-4 py-2">
            {mensagemErro
              .split('\n')
              .map((mensagem, index) => (
                <p
                  key={index}
                  className="font-mono text-xs text-(--nos-red)"
                >
                  {mensagem}
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
          type="submit"
          variant={
            editando
              ? 'secondary'
              : 'primary'
          }
          loading={salvando}
          onClick={salvar}
        >
          {editando
            ? 'Salvar alterações'
            : '+ Cadastrar'}
        </Button>

      </Modal.Footer>

    </Modal>
  )
}