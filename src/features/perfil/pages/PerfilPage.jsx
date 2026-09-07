import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

import { perfilService } from '../services/perfilService'
import { salvarUsuarioLocal } from '@/utils/usuarioLocal'
import { obterMensagemErro } from '@/utils/erros'

export default function PerfilPage() {
  const navigate = useNavigate()

  const [carregando, setCarregando] = useState(true)
  const [erroCarregamento, setErroCarregamento] = useState(null)

  const [dados, setDados] = useState({ nome: '', email: '' })
  const [errosDados, setErrosDados] = useState({})
  const [mensagemErroDados, setMensagemErroDados] = useState(null)
  const [mensagemSucessoDados, setMensagemSucessoDados] = useState(null)
  const [salvandoDados, setSalvandoDados] = useState(false)

  const [senha, setSenha] = useState({
    senhaAtual: '',
    novaSenha: '',
    confirmarSenha: '',
  })
  const [errosSenha, setErrosSenha] = useState({})
  const [mensagemErroSenha, setMensagemErroSenha] = useState(null)
  const [mensagemSucessoSenha, setMensagemSucessoSenha] = useState(null)
  const [salvandoSenha, setSalvandoSenha] = useState(false)

  useEffect(() => {
    carregar()
  }, [])

  async function carregar() {
    setCarregando(true)
    setErroCarregamento(null)

    try {
      const perfil = await perfilService.obter()

      setDados({ nome: perfil.nome, email: perfil.email })
    } catch {
      setErroCarregamento('Falha ao carregar seu perfil.')
    } finally {
      setCarregando(false)
    }
  }

  function alterarDados(e) {
    const { name, value } = e.target

    setDados((anterior) => ({ ...anterior, [name]: value }))

    if (errosDados[name]) {
      setErrosDados((anterior) => ({ ...anterior, [name]: null }))
    }

    setMensagemSucessoDados(null)
  }

  function validarDados() {
    const erros = {}

    if (!dados.nome.trim()) erros.nome = 'O nome é obrigatório.'
    if (!dados.email.trim()) erros.email = 'O e-mail é obrigatório.'

    return erros
  }

  async function salvarDados(e) {
    e.preventDefault()

    const errosValidacao = validarDados()

    if (Object.keys(errosValidacao).length > 0) {
      setErrosDados(errosValidacao)
      return
    }

    setSalvandoDados(true)
    setMensagemErroDados(null)
    setMensagemSucessoDados(null)

    try {
      const atualizado = await perfilService.atualizar({
        nome: dados.nome.trim(),
        email: dados.email.trim(),
      })

      salvarUsuarioLocal({
        id: atualizado.id,
        nome: atualizado.nome,
        email: atualizado.email,
      })

      setMensagemSucessoDados('Dados salvos com sucesso.')
    } catch (erro) {
      setMensagemErroDados(
        obterMensagemErro(erro?.response?.data, 'Erro ao salvar seus dados.')
      )
    } finally {
      setSalvandoDados(false)
    }
  }

  function alterarSenha(e) {
    const { name, value } = e.target

    setSenha((anterior) => ({ ...anterior, [name]: value }))

    if (errosSenha[name]) {
      setErrosSenha((anterior) => ({ ...anterior, [name]: null }))
    }

    setMensagemSucessoSenha(null)
  }

  function validarSenha() {
    const erros = {}

    if (!senha.senhaAtual) erros.senhaAtual = 'Informe sua senha atual.'

    if (!senha.novaSenha) {
      erros.novaSenha = 'Informe a nova senha.'
    } else if (senha.novaSenha.length < 6) {
      erros.novaSenha = 'A nova senha deve ter no mínimo 6 caracteres.'
    }

    if (senha.confirmarSenha !== senha.novaSenha) {
      erros.confirmarSenha = 'As senhas não coincidem.'
    }

    return erros
  }

  async function salvarSenha(e) {
    e.preventDefault()

    const errosValidacao = validarSenha()

    if (Object.keys(errosValidacao).length > 0) {
      setErrosSenha(errosValidacao)
      return
    }

    setSalvandoSenha(true)
    setMensagemErroSenha(null)
    setMensagemSucessoSenha(null)

    try {
      await perfilService.alterarSenha({
        senhaAtual: senha.senhaAtual,
        novaSenha: senha.novaSenha,
      })

      setSenha({ senhaAtual: '', novaSenha: '', confirmarSenha: '' })
      setMensagemSucessoSenha('Senha alterada com sucesso.')
    } catch (erro) {
      setMensagemErroSenha(
        obterMensagemErro(erro?.response?.data, 'Erro ao alterar a senha.')
      )
    } finally {
      setSalvandoSenha(false)
    }
  }

  return (
    <div className="min-h-screen bg-(--nos-bg) p-8 font-mono text-(--nos-text)">

      <div className="mb-2 flex items-center justify-between">
        <p className="text-[10px] uppercase tracking-[0.25em] text-(--nos-red)">
          N-OS / MEU PERFIL
        </p>

        <Button variant="ghost" onClick={() => navigate(-1)}>
          ← Voltar
        </Button>
      </div>

      <h1 className="mb-6 text-sm uppercase tracking-widest text-(--nos-text)">
        // MEU PERFIL
      </h1>

      <div className="space-y-6">

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
          <>

            <section>
              <p className="mb-4 text-[10px] uppercase tracking-[0.25em] text-(--nos-red)">
                // DADOS PESSOAIS
              </p>

              <form
                onSubmit={salvarDados}
                className="space-y-5 border border-(--nos-border) bg-(--nos-surface) p-5"
              >
                <div className="grid gap-5 md:grid-cols-2">
                  <Input
                    label="// NOME"
                    name="nome"
                    value={dados.nome}
                    onChange={alterarDados}
                    error={errosDados.nome}
                    required
                  />

                  <Input
                    label="// E-MAIL"
                    name="email"
                    type="email"
                    value={dados.email}
                    onChange={alterarDados}
                    error={errosDados.email}
                    required
                  />
                </div>

                {mensagemErroDados && (
                  <div className="border border-(--nos-red-border) bg-(--nos-red-dim) px-4 py-2">
                    <p className="text-xs text-(--nos-red)">{mensagemErroDados}</p>
                  </div>
                )}

                {mensagemSucessoDados && (
                  <div className="border border-(--nos-success)/40 bg-(--nos-success)/10 px-4 py-2">
                    <p className="text-xs text-(--nos-success)">{mensagemSucessoDados}</p>
                  </div>
                )}

                <div className="flex justify-end">
                  <Button variant="primary" type="submit" loading={salvandoDados}>
                    Salvar
                  </Button>
                </div>
              </form>
            </section>

            <section>
              <p className="mb-4 text-[10px] uppercase tracking-[0.25em] text-(--nos-red)">
                // ALTERAR SENHA
              </p>

              <form
                onSubmit={salvarSenha}
                className="space-y-5 border border-(--nos-border) bg-(--nos-surface) p-5"
              >
                <div className="grid gap-5 md:grid-cols-3">
                  <Input
                    label="// SENHA ATUAL"
                    name="senhaAtual"
                    type="password"
                    value={senha.senhaAtual}
                    onChange={alterarSenha}
                    error={errosSenha.senhaAtual}
                    required
                  />

                  <Input
                    label="// NOVA SENHA"
                    name="novaSenha"
                    type="password"
                    value={senha.novaSenha}
                    onChange={alterarSenha}
                    error={errosSenha.novaSenha}
                    required
                  />

                  <Input
                    label="// CONFIRMAR NOVA SENHA"
                    name="confirmarSenha"
                    type="password"
                    value={senha.confirmarSenha}
                    onChange={alterarSenha}
                    error={errosSenha.confirmarSenha}
                    required
                  />
                </div>

                {mensagemErroSenha && (
                  <div className="border border-(--nos-red-border) bg-(--nos-red-dim) px-4 py-2">
                    <p className="text-xs text-(--nos-red)">{mensagemErroSenha}</p>
                  </div>
                )}

                {mensagemSucessoSenha && (
                  <div className="border border-(--nos-success)/40 bg-(--nos-success)/10 px-4 py-2">
                    <p className="text-xs text-(--nos-success)">{mensagemSucessoSenha}</p>
                  </div>
                )}

                <div className="flex justify-end">
                  <Button variant="primary" type="submit" loading={salvandoSenha}>
                    Alterar senha
                  </Button>
                </div>
              </form>
            </section>

          </>
        )}

      </div>

    </div>
  )
}
