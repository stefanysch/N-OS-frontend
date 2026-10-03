import { useState } from 'react'

import Input from '@/components/ui/Input'

import { clienteService } from '../services/clienteService'
import { cepService } from '../services/cepService'
import { TIPO_DOCUMENTO } from '../validations/clienteValidation'
import {
  aplicarMaskCEP,
  aplicarMaskDocumento,
  aplicarMaskTelefone,
  somenteDigitos,
} from '@/utils/masks'

function aplicarMask(campo, valor, tipoDocumento) {
  if (campo === 'telefone') return aplicarMaskTelefone(valor)
  if (campo === 'cep') return aplicarMaskCEP(valor)
  if (campo === 'documento') return aplicarMaskDocumento(valor, tipoDocumento)

  return valor
}

/**
 * campos do formulário de cliente — nome, contato, documento e endereço.
 * compartilhado entre o ClienteModal (criação) e a aba de edição da
 * página de detalhe do cliente, pra não duplicar máscara/validação/CEP.
 */
export default function ClienteCampos({
  formulario,
  setFormulario,
  erros,
  setErros,
  idClienteAtual,
}) {
  const [verificandoDoc, setVerificandoDoc] = useState(false)
  const [buscandoCep, setBuscandoCep] = useState(false)

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
      valorFinal = aplicarMask(name, value, formulario.tipoDocumento)
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
      setErros((ant) => ({ ...ant, [name]: null }))
    }
  }

  async function verificarDocumento() {
    const doc = somenteDigitos(formulario.documento)

    if (!doc) return

    setVerificandoDoc(true)

    try {
      const todos = await clienteService.listar()

      const jaExiste = todos.some(
        (c) =>
          somenteDigitos(c.documento) === doc &&
          c.id !== idClienteAtual
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

  async function buscarCep() {
    const digitos = somenteDigitos(formulario.cep)

    if (digitos.length !== 8) return

    setBuscandoCep(true)

    try {
      const endereco = await cepService.buscarEndereco(digitos)

      if (endereco) {
        setFormulario((ant) => ({
          ...ant,
          logradouro: endereco.logradouro || ant.logradouro,
          bairro: endereco.bairro || ant.bairro,
          cidade: endereco.cidade || ant.cidade,
          estado: endereco.estado || ant.estado,
        }))

        setErros((ant) => ({
          ...ant,
          cep: null,
          logradouro: null,
          bairro: null,
          cidade: null,
          estado: null,
        }))
      } else {
        setErros((ant) => ({ ...ant, cep: 'CEP não encontrado' }))
      }
    } catch {
    } finally {
      setBuscandoCep(false)
    }
  }

  const placeholderDocumento =
    formulario.tipoDocumento === 1
      ? '000.000.000-00'
      : '00.000.000/0000-00'

  return (
    <>
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
              <option key={tipo.value} value={tipo.value}>
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
        // endereço (opcional)
      </p>

      <div className="grid grid-cols-[110px_1fr] gap-3">
        <div>
          <Input
            label="// CEP"
            name="cep"
            value={formulario.cep}
            onChange={alterarCampo}
            onBlur={buscarCep}
            placeholder="00000-000"
            error={erros.cep}
          />

          {buscandoCep && (
            <p className="mt-1 text-[10px] text-(--nos-text-muted)">
              Buscando...
            </p>
          )}
        </div>

        <Input
          label="// LOGRADOURO"
          name="logradouro"
          value={formulario.logradouro}
          onChange={alterarCampo}
          placeholder="Rua, Avenida..."
          error={erros.logradouro}
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
        />

        <Input
          label="// BAIRRO"
          name="bairro"
          value={formulario.bairro}
          onChange={alterarCampo}
          placeholder="Bairro"
          error={erros.bairro}
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
        />

        <Input
          label="// UF"
          name="estado"
          value={formulario.estado}
          onChange={alterarCampo}
          placeholder="PR"
          error={erros.estado}
        />
      </div>
    </>
  )
}
