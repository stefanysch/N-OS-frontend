import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'

import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'

import { dashboardService } from '../services/dashboardService'
import SecaoFaturamento from '../components/SecaoFaturamento'
import ValorSensivel from '../components/ValorSensivel'

import { statusOSParaPreset } from '@/utils/statusOS'
import { formatarData, formatarPlaca } from '@/utils/formatters'

const CHAVE_MOSTRAR_VALORES = 'nos:dashboard:mostrar-valores'

function lerPreferenciaMostrarValores() {
  try {
    return localStorage.getItem(CHAVE_MOSTRAR_VALORES) === '1'
  } catch {
    return false
  }
}

function salvarPreferenciaMostrarValores(valor) {
  try {
    localStorage.setItem(CHAVE_MOSTRAR_VALORES, valor ? '1' : '0')
  } catch {
    // localStorage indisponível — segue só com o estado em memória
  }
}

function CardEstatistica({ label, valor, destaque = false }) {
  return (
    <div className="border border-(--nos-border) bg-(--nos-surface) p-5">
      <p className="text-[10px] uppercase tracking-[0.2em] text-(--nos-text-muted)">
        // {label}
      </p>

      <p
        className={[
          'mt-2 text-2xl',
          destaque ? 'text-(--nos-red)' : 'text-(--nos-text)',
        ].join(' ')}
      >
        {valor}
      </p>
    </div>
  )
}

function SecaoLista({ titulo, vazio, children }) {
  return (
    <section>
      <p className="mb-4 text-[10px] uppercase tracking-[0.25em] text-(--nos-red)">
        // {titulo}
      </p>

      <div className="border border-(--nos-border) bg-(--nos-surface)">
        {children ?? (
          <div className="py-10 text-center text-xs uppercase tracking-widest text-(--nos-text-faint)">
            {vazio}
          </div>
        )}
      </div>
    </section>
  )
}

export default function DashboardPage() {
  const navigate = useNavigate()

  const [resumo, setResumo] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)

  const [mostrarValores, setMostrarValores] = useState(
    lerPreferenciaMostrarValores
  )

  function alternarMostrarValores() {
    const novoValor = !mostrarValores
    setMostrarValores(novoValor)
    salvarPreferenciaMostrarValores(novoValor)
  }

  useEffect(() => {
    carregar()
  }, [])

  async function carregar() {
    setCarregando(true)
    setErro(null)

    try {
      const dados = await dashboardService.obterResumo()
      setResumo(dados)
    } catch {
      setErro('Falha ao carregar o dashboard.')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div className="min-h-screen bg-(--nos-bg) font-mono text-(--nos-text)">

      <div className="flex items-center justify-between border-b border-(--nos-border) px-8 py-5">

        <div>
          <p className="text-[10px] uppercase tracking-[0.25em] text-(--nos-red)">
            N-OS / DASHBOARD
          </p>

          <h1 className="text-sm uppercase tracking-widest text-(--nos-text)">
            // DASHBOARD
          </h1>
        </div>

        <div className="flex items-center gap-3">

          <Button
            variant="ghost"
            onClick={alternarMostrarValores}
            title={
              mostrarValores
                ? 'Ocultar valores'
                : 'Mostrar valores'
            }
          >
            {mostrarValores ? (
              <Eye className="h-4 w-4" />
            ) : (
              <EyeOff className="h-4 w-4" />
            )}
            Valores
          </Button>

          <Button
            variant="secondary"
            onClick={() => navigate('/ordens/nova')}
          >
            + Nova OS
          </Button>

        </div>

      </div>

      <div className="mx-auto max-w-7xl px-8 py-8">

        {carregando && (
          <div className="flex items-center justify-center gap-2 py-16 text-xs uppercase tracking-widest text-(--nos-text-faint)">
            <span className="animate-pulse text-(--nos-red)">■</span>
            Carregando...
          </div>
        )}

        {erro && !carregando && (
          <div className="border border-(--nos-red-border) bg-(--nos-red-dim) px-4 py-3">
            <p className="text-xs text-(--nos-red)">{erro}</p>

            <Button
              variant="ghost"
              size="sm"
              className="mt-2"
              onClick={carregar}
            >
              Tentar novamente
            </Button>
          </div>
        )}

        {resumo && !carregando && !erro && (
          <div className="space-y-8">

            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <CardEstatistica
                label="Veículos ativos"
                valor={resumo.veiculosAtivos}
              />

              <CardEstatistica
                label="Novos clientes (30d)"
                valor={resumo.clientesNovosUltimos30Dias}
              />

              <CardEstatistica
                label="OS a fazer"
                valor={resumo.ordensAtivasTotal}
                destaque={resumo.ordensAtivasTotal > 0}
              />

              <CardEstatistica
                label="OS concluídas (30d)"
                valor={resumo.ordensConcluidasUltimos30Dias}
              />
            </div>

            {resumo.ordensPorStatus.length > 0 && (
              <div className="flex flex-wrap items-center gap-x-8 gap-y-3 border border-(--nos-border) bg-(--nos-surface) px-5 py-4">
                {resumo.ordensPorStatus.map((item) => (
                  <div
                    key={item.status}
                    className="flex items-center gap-2"
                  >
                    <Badge status={statusOSParaPreset(item.status)} />
                    <span className="text-xs text-(--nos-text)">
                      {item.quantidade}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

              <SecaoLista
                titulo="NOVOS CLIENTES"
                vazio="Nenhum cliente cadastrado ainda"
              >
                {resumo.clientesRecentes.length > 0 && (
                  <div>
                    {resumo.clientesRecentes.map((cliente, indice) => (
                      <button
                        key={cliente.id}
                        type="button"
                        onClick={() => navigate('/clientes')}
                        className={[
                          'flex w-full items-center justify-between px-4 py-3 text-left',
                          'transition-colors hover:bg-(--nos-surface-2)',
                          indice !== resumo.clientesRecentes.length - 1
                            ? 'border-b border-(--nos-border)'
                            : '',
                        ].join(' ')}
                      >
                        <span className="truncate pr-4 text-xs text-(--nos-text)">
                          {cliente.nome}
                        </span>

                        <span className="shrink-0 text-[10px] text-(--nos-text-muted)">
                          {formatarData(cliente.criadoEm)}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </SecaoLista>

              <SecaoLista
                titulo="OS RECÉM FECHADAS"
                vazio="Nenhuma OS concluída nos últimos 30 dias"
              >
                {resumo.ordensRecemFechadas.length > 0 && (
                  <div>
                    {resumo.ordensRecemFechadas.map((ordem, indice) => (
                      <button
                        key={ordem.id}
                        type="button"
                        onClick={() => navigate(`/ordens/${ordem.id}/editar`)}
                        className={[
                          'flex w-full items-center justify-between px-4 py-3 text-left',
                          'transition-colors hover:bg-(--nos-surface-2)',
                          indice !== resumo.ordensRecemFechadas.length - 1
                            ? 'border-b border-(--nos-border)'
                            : '',
                        ].join(' ')}
                      >
                        <div className="min-w-0 pr-4">
                          <p className="truncate text-xs text-(--nos-text)">
                            {ordem.clienteNome}
                          </p>
                          <p className="text-[10px] text-(--nos-text-muted)">
                            {formatarPlaca(ordem.veiculoPlaca)}
                            {' — '}
                            {formatarData(ordem.dataConclusao)}
                          </p>
                        </div>

                        <ValorSensivel
                          valor={ordem.valorTotal}
                          mostrar={mostrarValores}
                          className="shrink-0 text-xs text-(--nos-text)"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </SecaoLista>

            </div>

            <SecaoLista
              titulo="A FAZER"
              vazio="Nenhuma OS em aberto — tudo em dia"
            >
              {resumo.ordensAFazer.length > 0 && (
                <div>
                  {resumo.ordensAFazer.map((ordem, indice) => {
                    return (
                      <button
                        key={ordem.id}
                        type="button"
                        onClick={() => navigate(`/ordens/${ordem.id}/editar`)}
                        className={[
                          'grid w-full grid-cols-[1fr_1fr_140px_100px] items-center gap-3 px-4 py-3 text-left',
                          'transition-colors hover:bg-(--nos-surface-2)',
                          indice !== resumo.ordensAFazer.length - 1
                            ? 'border-b border-(--nos-border)'
                            : '',
                        ].join(' ')}
                      >
                        <span className="truncate text-xs text-(--nos-text)">
                          {ordem.clienteNome}
                        </span>

                        <span className="truncate text-xs text-(--nos-text-muted)">
                          {formatarPlaca(ordem.veiculoPlaca)}
                        </span>

                        <Badge status={statusOSParaPreset(ordem.status)} />

                        <ValorSensivel
                          valor={ordem.valorTotal}
                          mostrar={mostrarValores}
                          className="text-right text-xs text-(--nos-text)"
                        />
                      </button>
                    )
                  })}
                </div>
              )}
            </SecaoLista>

            <SecaoFaturamento mostrarValores={mostrarValores} />

          </div>
        )}

      </div>

    </div>
  )
}
