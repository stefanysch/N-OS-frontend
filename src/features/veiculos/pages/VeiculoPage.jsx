import { useEffect, useState } from 'react'

import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import SearchInput from '@/components/ui/SearchInput'
import ModalConfirmacao from '@/components/shared/ModalConfirmacao'

import VeiculoModal from '../components/VeiculoModal'

import { veiculoService } from '../services/veiculoService'
import { clienteService } from '@/features/clientes/services/clienteService'
import { formatarPlaca } from '@/utils/formatters'

export default function VeiculoPage() {

  const [veiculos, setVeiculos] = useState([])
  const [clientesPorId, setClientesPorId] = useState({})
  const [busca, setBusca] = useState('')
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)
  const [modalAberto, setModalAberto] = useState(false)
  const [veiculoEdicao, setVeiculoEdicao] = useState(null)
  const [confirmacaoStatus, setConfirmacaoStatus] = useState(null)
  const [alterandoStatus, setAlterandoStatus] = useState(false)

  useEffect(() => {
    carregar()
  }, [])

  async function carregar() {
    setCarregando(true)
    setErro(null)

    try {
      const [dadosVeiculos, dadosClientes] = await Promise.all([
        veiculoService.listar(),
        clienteService.listar(),
      ])

      setVeiculos(Array.isArray(dadosVeiculos) ? dadosVeiculos : [])

      setClientesPorId(
        Object.fromEntries(
          (Array.isArray(dadosClientes) ? dadosClientes : [])
            .map((cliente) => [cliente.id, cliente])
        )
      )
    } catch {
      setErro('Falha ao carregar veículos.')
    } finally {
      setCarregando(false)
    }
  }

  function abrirCriacao() {
    setVeiculoEdicao(null)
    setModalAberto(true)
  }

  function abrirEdicao(veiculo) {
    setVeiculoEdicao(veiculo)
    setModalAberto(true)
  }

  function abrirConfirmacao(veiculo) {
    setConfirmacaoStatus({
      id: veiculo.id,
      ativo: veiculo.ativo,
      mensagem: veiculo.ativo
        ? `Deseja inativar "${veiculo.modelo} ${veiculo.placa}"?`
        : `Deseja reativar "${veiculo.modelo} ${veiculo.placa}"?`
    })
  }

  async function confirmarAlteracaoStatus() {
    setAlterandoStatus(true)

    try {
      if (confirmacaoStatus.ativo) {
        await veiculoService.inativar(confirmacaoStatus.id)
      } else {
        await veiculoService.reativar(confirmacaoStatus.id)
      }

      await carregar()
    } catch {
      setErro('Erro ao alterar status do veículo.')
    } finally {
      setAlterandoStatus(false)
      setConfirmacaoStatus(null)
    }
  }

  const buscaNormalizada = busca.trim().toLowerCase()

  const veiculosFiltrados = veiculos.filter((veiculo) => {
    const nomeCliente = clientesPorId[veiculo.clienteId]?.nome ?? ''

    return (
      veiculo.placa?.toLowerCase()?.includes(buscaNormalizada) ||
      nomeCliente.toLowerCase().includes(buscaNormalizada)
    )
  })

  return (
    <div className="min-h-screen bg-(--nos-bg) font-data text-(--nos-text)">

      <div className="flex items-center justify-between border-b border-(--nos-border) px-8 py-5">

        <div>
          <p className="font-ui text-[10px] uppercase tracking-[0.25em] text-(--nos-red)">
            N-OS / VEÍCULOS
          </p>

          <h1 className="font-ui text-sm uppercase tracking-widest text-(--nos-text)">
            // VEÍCULOS
          </h1>
        </div>

        <Button
          variant="secondary"
          onClick={abrirCriacao}
        >
          + Novo Veículo
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

            <p className="font-data text-xs text-(--nos-red)">
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

            <div className="grid grid-cols-[80px_1fr_120px_1fr_80px_100px_150px] border-b border-(--nos-border) bg-(--nos-surface) px-4 py-3">

              {[
                '// ID',
                '// CLIENTE',
                '// PLACA',
                '// MODELO',
                '// ANO',
                '// STATUS',
                '// AÇÕES',
              ].map((coluna) => (
                <span
                  key={coluna}
                  className="font-ui text-[10px] uppercase tracking-[0.15em] text-(--nos-text-faint)"
                >
                  {coluna}
                </span>
              ))}

            </div>

            {veiculosFiltrados.length === 0 && (
              <div className="py-12 text-center text-xs uppercase tracking-widest text-(--nos-text-faint)">
                {busca
                  ? 'Nenhum veículo encontrado para essa busca'
                  : 'Nenhum veículo cadastrado'}
              </div>
            )}

            {veiculosFiltrados.map((veiculo, indice) => (
              <div
                key={veiculo.id}
                className={[
                  'grid grid-cols-[80px_1fr_120px_1fr_80px_100px_150px]',
                  'items-center px-4 py-3',
                  'transition-colors hover:bg-(--nos-surface-2)',
                  indice !== veiculosFiltrados.length - 1
                    ? 'border-b border-(--nos-border)'
                    : '',
                  !veiculo.ativo ? 'opacity-40' : '',
                ].join(' ')}
              >

                <span className="font-data text-xs text-(--nos-red)">
                  #{String(veiculo.id).padStart(4, '0')}
                </span>

                <div className="pr-4">

                  <span className="block truncate text-xs text-(--nos-text)">
                    {clientesPorId[veiculo.clienteId]?.nome || '—'}
                  </span>

                  <span className="text-[10px] text-(--nos-text-muted)">
                    #{String(veiculo.clienteId).padStart(4, '0')}
                  </span>

                </div>

                <span className="font-data text-xs tracking-widest text-(--nos-text)">
                  {formatarPlaca(veiculo.placa)}
                </span>

                <div className="pr-4">

                  <span className="block truncate text-xs text-(--nos-text)">
                    {veiculo.marca} {veiculo.modelo}
                  </span>

                  {veiculo.cor && (
                    <span className="text-[10px] text-(--nos-text-muted)">
                      {veiculo.cor}
                    </span>
                  )}

                </div>

                <span className="text-xs text-(--nos-text-muted)">
                  {veiculo.ano}
                </span>

                <Badge
                  status={
                    veiculo.ativo
                      ? 'ativo'
                      : 'inativo'
                  }
                />

                <div className="flex items-center gap-2">

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => abrirEdicao(veiculo)}
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
                      veiculo.ativo
                        ? 'hover:!text-(--nos-red)'
                        : 'hover:!text-(--nos-success)'
                    }
                    onClick={() => abrirConfirmacao(veiculo)}
                  >
                    {veiculo.ativo
                      ? 'Inativar'
                      : 'Reativar'}
                  </Button>

                </div>

              </div>
            ))}

          </div>
        )}

        {!carregando && !erro && veiculosFiltrados.length > 0 && (
          <div className="mt-3 flex justify-between text-[10px] uppercase tracking-widest text-(--nos-text-faint)">

            <span>
              {veiculosFiltrados.length} veículo(s)
            </span>

            <span>
              {veiculosFiltrados.filter((v) => v.ativo).length} ativos
              {' • '}
              {veiculosFiltrados.filter((v) => !v.ativo).length} inativos
            </span>

          </div>
        )}

      </div>

      <VeiculoModal
        aberto={modalAberto}
        onFechar={() => setModalAberto(false)}
        veiculoEdicao={veiculoEdicao}
        onSucesso={carregar}
      />

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