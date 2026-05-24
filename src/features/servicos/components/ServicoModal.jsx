import { useEffect, useState } from 'react'

import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'

import { servicoService } from '../services/servicoService'

import {
  validarServico,
  montarPayloadServico
} from '@/validations/servicoValidation'



const FORMULARIO_INICIAL = {
  nome: '',
  descricao: '',
  valor: ''
}



function extrairMensagensErro(data) {

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
    useState(FORMULARIO_INICIAL)

  const [erros, setErros] =
    useState({})

  const [salvando, setSalvando] =
    useState(false)

  const [erroGeral, setErroGeral] =
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

      setFormulario(FORMULARIO_INICIAL)
    }

    setErros({})
    setErroGeral(null)

  }, [servicoEdicao, aberto, editando])



  function handleAlterarCampo(event) {

    const { name, value } = event.target

    setFormulario((estadoAnterior) => ({
      ...estadoAnterior,
      [name]: value
    }))

    if (erros[name]) {

      setErros((estadoAnterior) => ({
        ...estadoAnterior,
        [name]: null
      }))
    }
  }



  async function handleSalvar(event) {

    event.preventDefault()

    const errosValidacao =
      validarServico(formulario)

    if (Object.keys(errosValidacao).length > 0) {

      setErros(errosValidacao)

      return
    }

    setSalvando(true)

    setErroGeral(null)

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

      const mensagemErro =
        extrairMensagensErro(
          erro?.response?.data
        )

      setErroGeral(mensagemErro)

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
          onChange={handleAlterarCampo}
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
          onChange={handleAlterarCampo}
          placeholder="Descrição técnica do procedimento"
          error={erros.descricao}
        />

        <Input
          label="// VALOR (R$)"
          name="valor"
          type="number"
          step="0.01"
          min="0"
          value={formulario.valor}
          onChange={handleAlterarCampo}
          placeholder="0,00"
          required
          error={erros.valor}
        />

        {erroGeral && (

          <div className="border border-[#e11d48]/30 bg-[#e11d48]/10 px-4 py-2">

            {erroGeral
              .split('\n')
              .map((mensagem, index) => (

                <p
                  key={index}
                  className="font-mono text-xs text-[#e11d48]"
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
          variant={
            editando
              ? 'secondary'
              : 'primary'
          }
          type="submit"
          loading={salvando}
          onClick={handleSalvar}
        >
          {editando
            ? 'Salvar alterações'
            : '+ Cadastrar'}
        </Button>

      </Modal.Footer>

    </Modal>
  )
}