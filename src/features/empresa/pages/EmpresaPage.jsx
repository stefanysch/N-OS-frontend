import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

import { empresaService } from '../services/empresaService'
import { obterMensagemErro } from '@/utils/erros'
import {
  aplicarMaskDocumento,
  aplicarMaskTelefone,
  somenteDigitos,
} from '@/utils/masks'
import {
  documentoValido,
  emailValido,
  telefoneValido,
} from '@/utils/validators'

const FORMULARIO_VAZIO = {
  nome: '',
  documento: '',
  telefone: '',
  email: '',
  endereco: '',
}

function validarEmpresa(formulario) {
  const erros = {}

  if (!formulario.nome.trim())
    erros.nome = 'O nome da empresa é obrigatório.'

  // documento, telefone e e-mail são opcionais, mas se preenchidos precisam ser válidos
  if (formulario.documento.trim() && !documentoValido(formulario.documento))
    erros.documento = 'CPF ou CNPJ inválido'

  if (formulario.telefone.trim() && !telefoneValido(formulario.telefone))
    erros.telefone = 'Telefone inválido. Informe DDD e número'

  if (formulario.email.trim() && !emailValido(formulario.email))
    erros.email = 'E-mail inválido'

  return erros
}

export default function EmpresaPage() {
  const navigate = useNavigate()

  const [formulario, setFormulario] = useState(FORMULARIO_VAZIO)
  const [carregando, setCarregando] = useState(true)
  const [erroCarregamento, setErroCarregamento] = useState(null)

  const [erros, setErros] = useState({})
  const [mensagemErro, setMensagemErro] = useState(null)
  const [mensagemSucesso, setMensagemSucesso] = useState(null)
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    carregar()
  }, [])

  async function carregar() {
    setCarregando(true)
    setErroCarregamento(null)

    try {
      const dados = await empresaService.obter()

      setFormulario({
        nome: dados.nome ?? '',
        documento: aplicarMaskDocumento(dados.documento),
        telefone: aplicarMaskTelefone(dados.telefone),
        email: dados.email ?? '',
        endereco: dados.endereco ?? '',
      })
    } catch {
      setErroCarregamento('Falha ao carregar os dados da empresa.')
    } finally {
      setCarregando(false)
    }
  }

  function alterarCampo(e) {
    const { name, value } = e.target

    // sem seletor de tipo: até 11 dígitos é CPF, acima disso é CNPJ
    let valorFinal = value

    if (name === 'documento') valorFinal = aplicarMaskDocumento(value)
    if (name === 'telefone') valorFinal = aplicarMaskTelefone(value)

    setFormulario((anterior) => ({
      ...anterior,
      [name]: valorFinal,
    }))

    if (erros[name]) {
      setErros((anterior) => ({ ...anterior, [name]: null }))
    }

    setMensagemSucesso(null)
  }

  async function salvar(e) {
    e.preventDefault()

    const errosValidacao = validarEmpresa(formulario)

    if (Object.keys(errosValidacao).length > 0) {
      setErros(errosValidacao)
      return
    }

    setErros({})

    setSalvando(true)
    setMensagemErro(null)
    setMensagemSucesso(null)

    try {
      await empresaService.atualizar({
        nome: formulario.nome.trim(),
        documento: somenteDigitos(formulario.documento) || null,
        telefone: somenteDigitos(formulario.telefone) || null,
        email: formulario.email.trim() || null,
        endereco: formulario.endereco.trim() || null,
      })

      setMensagemSucesso('Dados da empresa salvos com sucesso.')
    } catch (erro) {
      setMensagemErro(
        obterMensagemErro(erro?.response?.data, 'Erro ao salvar os dados da empresa.')
      )
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className="min-h-screen bg-(--nos-bg) p-8 font-mono text-(--nos-text)">

      <div className="mb-2 flex items-center justify-between">
        <p className="text-[10px] uppercase tracking-[0.25em] text-(--nos-red)">
          N-OS / PERFIL DA EMPRESA
        </p>

        <Button variant="ghost" onClick={() => navigate(-1)}>
          ← Voltar
        </Button>
      </div>

      <h1 className="text-sm uppercase tracking-widest text-(--nos-text)">
        // DADOS DA EMPRESA
      </h1>

      <p className="mt-1 mb-6 text-[11px] text-(--nos-text-faint)">
        Esses dados aparecem no cabeçalho do PDF das ordens de serviço.
      </p>

        {carregando && (
          <div className="flex items-center justify-center gap-2 py-16 text-xs uppercase tracking-widest text-(--nos-text-faint)">
            <span className="animate-pulse text-(--nos-red)">■</span>
            Carregando...
          </div>
        )}

        {erroCarregamento && !carregando && (
          <div className="border border-(--nos-red-border) bg-(--nos-red-dim) px-4 py-3">
            <p className="text-xs text-(--nos-red)">{erroCarregamento}</p>

            <Button variant="ghost" size="sm" className="mt-2" onClick={carregar}>
              Tentar novamente
            </Button>
          </div>
        )}

        {!carregando && !erroCarregamento && (
          <form
            onSubmit={salvar}
            noValidate
            className="space-y-5 border border-(--nos-border) bg-(--nos-surface) p-5"
          >
            <Input
              label="// NOME DA EMPRESA"
              name="nome"
              value={formulario.nome}
              onChange={alterarCampo}
              placeholder="Nome da sua oficina"
              error={erros.nome}
              required
            />

            <div className="grid gap-5 md:grid-cols-3">
              <Input
                label="// CNPJ / CPF"
                name="documento"
                value={formulario.documento}
                onChange={alterarCampo}
                placeholder="CPF ou CNPJ"
                error={erros.documento}
                inputMode="numeric"
              />

              <Input
                label="// TELEFONE"
                name="telefone"
                value={formulario.telefone}
                onChange={alterarCampo}
                placeholder="(00) 00000-0000"
                error={erros.telefone}
                inputMode="tel"
              />

              <Input
                label="// E-MAIL"
                name="email"
                type="email"
                value={formulario.email}
                onChange={alterarCampo}
                placeholder="Opcional"
                error={erros.email}
              />
            </div>

            <Input
              label="// ENDEREÇO"
              name="endereco"
              value={formulario.endereco}
              onChange={alterarCampo}
              placeholder="Opcional"
            />

            {mensagemErro && (
              <div className="border border-(--nos-red-border) bg-(--nos-red-dim) px-4 py-2">
                <p className="text-xs text-(--nos-red)">{mensagemErro}</p>
              </div>
            )}

            {mensagemSucesso && (
              <div className="border border-(--nos-success)/40 bg-(--nos-success)/10 px-4 py-2">
                <p className="text-xs text-(--nos-success)">{mensagemSucesso}</p>
              </div>
            )}

            <div className="flex justify-end">
              <Button variant="primary" type="submit" loading={salvando}>
                Salvar
              </Button>
            </div>
          </form>
        )}

    </div>
  )
}
