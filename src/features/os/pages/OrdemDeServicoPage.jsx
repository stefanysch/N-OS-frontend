import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import SearchInput from '@/components/ui/SearchInput'
import ModalConfirmacao from '@/components/shared/ModalConfirmacao'

import { statusOSParaPreset } from '@/utils/statusOS'

import { ordemDeServicoService } from '../services/ordemDeServicoService'
import { veiculoService } from '@/features/veiculos/services/veiculoService'
import { clienteService } from '@/features/clientes/services/clienteService'

import { formatarMoeda, formatarPlaca } from '@/utils/formatters'

export default function OrdemDeServicoPage() {
  const navigate = useNavigate()

  const [ordens, setOrdens] = useState([])
  const [veiculosPorId, setVeiculosPorId] = useState({})
  const [clientesPorId, setClientesPorId] = useState({})
  const [busca, setBusca] = useState('')

  const [carregando, setCarregando] =
    useState(true)

  const [erro, setErro] =
    useState(null)

  const [confirmacaoStatus, setConfirmacaoStatus] =
    useState(null)

  const [alterandoStatus, setAlterandoStatus] =
    useState(false)

  useEffect(() => {
    carregar()
  }, [])

  async function carregar() {
    setCarregando(true)
    setErro(null)

    try {
      const [dadosOrdens, dadosVeiculos, dadosClientes] =
        await Promise.all([
          ordemDeServicoService.listar(),
          veiculoService.listar(),
          clienteService.listar(),
        ])

      setOrdens(Array.isArray(dadosOrdens) ? dadosOrdens : [])

      setVeiculosPorId(
        Object.fromEntries(
          (Array.isArray(dadosVeiculos) ? dadosVeiculos : [])
            .map((veiculo) => [veiculo.id, veiculo])
        )
      )

      setClientesPorId(
        Object.fromEntries(
          (Array.isArray(dadosClientes) ? dadosClientes : [])
            .map((cliente) => [cliente.id, cliente])
        )
      )
    } catch {
      setErro('Falha ao carregar ordens de serviço.')
    } finally {
      setCarregando(false)
    }
  }

  function abrirConfirmacao(ordem) {
    setConfirmacaoStatus({
      id: ordem.id,
      ativo: ordem.ativo,
      mensagem: ordem.ativo
        ? `Deseja inativar a OS #${String(ordem.id).padStart(4, '0')}?`
        : `Deseja reativar a OS #${String(ordem.id).padStart(4, '0')}?`,
    })
  }

  async function confirmarAlteracaoStatus() {
    setAlterandoStatus(true)

    try {
      if (confirmacaoStatus.ativo) {
        await ordemDeServicoService.inativar(confirmacaoStatus.id)
      } else {
        await ordemDeServicoService.reativar(confirmacaoStatus.id)
      }

      await carregar()
    } catch {
      setErro('Erro ao alterar status da ordem de serviço.')
    } finally {
      setAlterandoStatus(false)
      setConfirmacaoStatus(null)
    }
  }

  const buscaNormalizada = busca.trim().toLowerCase()

  const ordensFiltradas = ordens.filter((ordem) => {
    const veiculo = veiculosPorId[ordem.veiculoId]
    const cliente = veiculo ? clientesPorId[veiculo.clienteId] : null

    return (
      veiculo?.placa?.toLowerCase()?.includes(buscaNormalizada) ||
      cliente?.nome?.toLowerCase()?.includes(buscaNormalizada) ||
      false
    )
  })

  return (
    <div className="min-h-screen bg-(--nos-bg) font-mono text-(--nos-text)">

      <div className="flex items-center justify-between border-b border-(--nos-border) px-8 py-5">

        <div>
          <p className="text-[10px] uppercase tracking-[0.25em] text-(--nos-red)">
            N-OS / ORDENS DE SERVIÇO
          </p>

          <h1 className="text-sm uppercase tracking-widest text-(--nos-text)">
            // ORDENS DE SERVIÇO
          </h1>
        </div>

        <Button
          variant="secondary"
          onClick={() => navigate('/ordens/nova')}
        >
          + Nova OS
        </Button>

      </div>

      <div className="px-8 py-6">

        <div className="mb-4">
          <SearchInput
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por placa ou cliente..."
          />
        </div>

        {carregando && (
          <div className="flex items-center justify-center gap-2 py-16 text-xs uppercase tracking-widest text-(--nos-text-faint)">
            <span className="animate-pulse text-(--nos-red)">
              ■
            </span>

            Carregando...
          </div>
        )}

        {erro && !carregando && (
          <div className="border border-(--nos-red-border) bg-(--nos-red-dim) px-4 py-3">

            <p className="font-mono text-xs text-(--nos-red)">
              {erro}
            </p>

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

        {!carregando && !erro && (
          <div className="border border-(--nos-border)">

            <div className="grid grid-cols-[80px_1fr_1fr_2fr_140px_110px_150px] border-b border-(--nos-border) bg-(--nos-surface) px-4 py-3">

              {[
                '// ID',
                '// CLIENTE',
                '// VEÍCULO',
                '// PROBLEMA',
                '// STATUS',
                '// TOTAL',
                '// AÇÕES',
              ].map((coluna) => (
                <span
                  key={coluna}
                  className="text-[10px] uppercase tracking-[0.15em] text-(--nos-text-muted)"
                >
                  {coluna}
                </span>
              ))}

            </div>

            {ordensFiltradas.length === 0 && (
              <div className="py-12 text-center text-xs uppercase tracking-widest text-(--nos-text-faint)">
                {busca
                  ? 'Nenhuma ordem de serviço encontrada para essa busca'
                  : 'Nenhuma ordem de serviço cadastrada'}
              </div>
            )}

            {ordensFiltradas.map((ordem, indice) => {
              const veiculo = veiculosPorId[ordem.veiculoId]
              const cliente = veiculo ? clientesPorId[veiculo.clienteId] : null

              return (
                <div
                  key={ordem.id}
                  className={[
                    'grid grid-cols-[80px_1fr_1fr_2fr_140px_110px_150px]',
                    'items-center px-4 py-3',
                    'transition-colors hover:bg-(--nos-surface-2)',
                    indice !== ordensFiltradas.length - 1
                      ? 'border-b border-(--nos-border)'
                      : '',
                    !ordem.ativo ? 'opacity-40' : '',
                  ].join(' ')}
                >

                  <span className="font-mono text-xs text-(--nos-red)">
                    #{String(ordem.id).padStart(4, '0')}
                  </span>

                  <span className="truncate pr-4 text-xs text-(--nos-text)">
                    {cliente?.nome || '—'}
                  </span>

                  <span className="truncate pr-4 text-xs text-(--nos-text-muted)">
                    {veiculo ? formatarPlaca(veiculo.placa) : '—'}
                  </span>

                  <span className="truncate pr-4 text-xs text-(--nos-text-muted)">
                    {ordem.descricaoProblema || '—'}
                  </span>

                  <Badge status={statusOSParaPreset(ordem.status)} />

                  <span className="text-xs text-(--nos-text)">
                    {formatarMoeda(ordem.valorTotal)}
                  </span>

                  <div className="flex items-center gap-2">

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => navigate(`/ordens/${ordem.id}/editar`)}
                    >
                      Editar
                    </Button>

                    <span className="text-(--nos-border-2)">
                      |
                    </span>

                    <Button
                      size="sm"
                      variant="ghost"
                      className={
                        ordem.ativo
                          ? 'hover:!text-(--nos-red)'
                          : 'hover:!text-emerald-500'
                      }
                      onClick={() => abrirConfirmacao(ordem)}
                    >
                      {ordem.ativo
                        ? 'Inativar'
                        : 'Reativar'}
                    </Button>

                  </div>

                </div>
              )
            })}

          </div>

        )}

        {!carregando && !erro && ordensFiltradas.length > 0 && (
          <div className="mt-3 flex justify-between text-[10px] uppercase tracking-widest text-(--nos-text-faint)">

            <span>
              {ordensFiltradas.length} ordem(ns)
            </span>

            <span>
              {ordensFiltradas.filter((o) => o.ativo).length} ativas
              {' • '}
              {ordensFiltradas.filter((o) => !o.ativo).length} inativas
            </span>

          </div>
        )}

      </div>

      <ModalConfirmacao
        aberto={Boolean(confirmacaoStatus)}
        mensagem={confirmacaoStatus?.mensagem}
        carregando={alterandoStatus}
        onConfirmar={confirmarAlteracaoStatus}
        onCancelar={() => setConfirmacaoStatus(null)}
        textoBotao={
          confirmacaoStatus?.ativo
            ? 'Inativar'
            : 'Reativar'
        }
        varianteBotao={
          confirmacaoStatus?.ativo
            ? 'danger'
            : 'secondary'
        }
      />

    </div>
  )
}
