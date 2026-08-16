import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import Button from '@/components/ui/Button'

import logo from '@/assets/n-os.svg'

import { validarLogin } from '@/features/auth/validations/authValidation'
import { authService } from '@/features/auth/services/authService'

export default function LoginPage() {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')

  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [erros, setErros] = useState({})
  const [carregando, setCarregando] = useState(false)

  async function entrar(e) {
    e.preventDefault()

    const novosErros = validarLogin({ email, senha })

    if (Object.keys(novosErros).length > 0) {
      setErros(novosErros)
      return
    }

    setCarregando(true)

    try {
      const resposta = await authService.login({ email, senha })

      localStorage.setItem('nos-token', resposta.token)

      navigate('/')
    } catch (erro) {
      setErros({
        geral:
          erro?.response?.data?.mensagem ??
          'Não foi possível realizar o login.',
      })
    } finally {
      setCarregando(false)
    }
  }

  return (
    <main className="min-h-screen bg-(--nos-bg) font-mono text-(--nos-text)">

      <div className="flex min-h-screen items-center justify-center px-6">

        <div className="w-full max-w-sm">
            
          <div className="mb-10 flex justify-center">

            <img
              src={logo}
              alt="N-OS"
              className="h-auto w-40"
            />

          </div>

          <div className="mb-3">

            <p className="mb-2 text-[10px] uppercase tracking-[0.3em] text-(--nos-red)">
              // ACESSO AO SISTEMA
            </p>

            <h1 className="text-lg uppercase tracking-[0.15em] text-(--nos-text)">
              Entrar
            </h1>

          </div>

          <form
            onSubmit={entrar}
            className="border border-(--nos-border) bg-(--nos-surface) p-6"
          >

            {erros.geral && (
              <div className="mb-5 border border-(--nos-red-border) bg-(--nos-red-dim) px-3 py-3">

                <p className="text-[10px] leading-relaxed text-(--nos-red)">
                  {erros.geral}
                </p>

              </div>
            )}

            <div className="mb-5">

              <label className="mb-2 block text-[10px] uppercase tracking-[0.15em] text-(--nos-text-muted)">
                // E-MAIL
                <span className="ml-1 text-(--nos-red)">
                  *
                </span>
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)

                  if (erros.email) {
                    setErros((anterior) => ({
                      ...anterior,
                      email: undefined,
                    }))
                  }
                }}
                placeholder="seu@email.com"
                autoComplete="email"
                className={[
                  'w-full border bg-(--nos-bg)',
                  'px-3 py-3',
                  'font-mono text-xs text-(--nos-text)',
                  'placeholder-(--nos-text-faint)',
                  'focus:outline-none',
                  erros.email
                    ? 'border-(--nos-red)'
                    : 'border-(--nos-border-2) focus:border-(--nos-red)',
                ].join(' ')}
              />

              {erros.email && (
                <p className="mt-1.5 text-[10px] text-(--nos-red)">
                  {erros.email}
                </p>
              )}

            </div>

            <div className="mb-6">

              <div className="mb-2 flex items-center justify-between">

                <label className="text-[10px] uppercase tracking-[0.15em] text-(--nos-text-muted)">
                  // SENHA
                  <span className="ml-1 text-(--nos-red)">
                    *
                  </span>
                </label>

                <button
                  type="button"
                  className="text-[9px] uppercase tracking-widest text-(--nos-text-muted) transition-colors hover:text-(--nos-text)"
                  onClick={() =>
                    setMostrarSenha(
                      (anterior) => !anterior
                    )
                  }
                >
                  {mostrarSenha
                    ? 'Ocultar'
                    : 'Mostrar'}
                </button>

              </div>

              <input
                type={
                  mostrarSenha
                    ? 'text'
                    : 'password'
                }
                value={senha}
                onChange={(e) => {
                  setSenha(e.target.value)

                  if (erros.senha) {
                    setErros((anterior) => ({
                      ...anterior,
                      senha: undefined,
                    }))
                  }
                }}
                placeholder="••••••••"
                autoComplete="current-password"
                className={[
                  'w-full border bg-(--nos-bg)',
                  'px-3 py-3',
                  'font-mono text-xs text-(--nos-text)',
                  'placeholder-(--nos-text-faint)',
                  'focus:outline-none',
                  erros.senha
                    ? 'border-(--nos-red)'
                    : 'border-(--nos-border-2) focus:border-(--nos-red)',
                ].join(' ')}
              />

              {erros.senha && (
                <p className="mt-1.5 text-[10px] text-(--nos-red)">
                  {erros.senha}
                </p>
              )}

            </div>

            <Button
              type="submit"
              variant="primary"
              loading={carregando}
              className="w-full"
            >
              Entrar
            </Button>

          </form>

          <div className="mt-3 flex items-center justify-between">

            <span className="text-[9px] uppercase tracking-widest text-(--nos-text-faint)">
              N-OS SYSTEM
            </span>

            <span className="text-[9px] uppercase tracking-widest text-(--nos-text-faint)">
              v1.0
            </span>

          </div>

        </div>

      </div>

    </main>
  )
}