import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import SearchInput from '@/components/ui/SearchInput'
import ModalConfirmacao from '@/components/shared/ModalConfirmacao'

import ClienteModal from '../components/ClienteModal'
import VeiculoModal from '@/features/veiculos/components/VeiculoModal'

import { clienteService } from '../services/clienteService'
import { formatarDocumento, formatarTelefone } from '@/utils/formatters'

export default function ClientePage() {

  const navigate = useNavigate()

  const [clientes, setClientes] = useState([])
  const [busca, setBusca] = useState('')
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)

  // ─── modal cliente ────────────────────────────────────────────────────────
  const [modalClienteAberto, setModalClienteAberto] = useState(false)
  const [clienteEdicao, setClienteEdicao] = useState(null)

  // ─── modal veículo (wizard) ───────────────────────────────────────────────
  const [modalVeiculoAberto, setModalVeiculoAberto] = useState(false)
  const [clienteWizard, setClienteWizard] = useState(null)

  // ─── confirmação de status ────────────────────────────────────────────────
  const [confirmacaoStatus, setConfirmacaoStatus] = useState(null)
  const [alterandoStatus, setAlterandoStatus] = useState(false)

  useEffect(() => {
    carregar()
  }, [])

  async function carregar() {
    setCarregando(true)
    setErro(null)

    try {
      const dados = await clienteService.listar()
      setClientes(Array.isArray(dados) ? dados : [])
    } catch {
      setErro('Falha ao carregar clientes.')
    } finally {
      setCarregando(false)
    }
  }

  // abre modal de criação — fluxo wizard
  function abrirCriacao() {
    setClienteEdicao(null)
    setModalClienteAberto(true)
  }

  // abre modal de edição — fluxo normal
  function abrirEdicao(cliente) {
    setClienteEdicao(cliente)
    setModalClienteAberto(true)
  }

  // passo 1 concluído: cliente criado → abre modal de veículo
  function aoAvancarParaVeiculo(clienteCriado) {
    setModalClienteAberto(false)
    setClienteWizard(clienteCriado)
    setModalVeiculoAberto(true)
  }

  // passo 2 concluído: veículo criado → vai pra nova OS com estado
  function aoConclurirWizard({ cliente, veiculo }) {
    setModalVeiculoAberto(false)
    navigate('/os/nova', { state: { cliente, veiculo } })
  }

  function abrirConfirmacao(cliente) {
    setConfirmacaoStatus({
      id: cliente.id,
      ativo: cliente.ativo,
      mensagem: cliente.ativo
        ? `Deseja inativar "${cliente.nome}"?`
        : `Deseja reativar "${cliente.nome}"?`
    })
  }

  async function confirmarAlteracaoStatus() {
    setAlterandoStatus(true)

    try {
      if (confirmacaoStatus.ativo) {
        await clienteService.inativar(confirmacaoStatus.id)
      } else {
        await clienteService.reativar(confirmacaoStatus.id)
      }

      await carregar()
    } catch {
      setErro('Erro ao alterar status do cliente.')
    } finally {
      setAlterandoStatus(false)
      setConfirmacaoStatus(null)
    }
  }

  const clientesFiltrados = clientes.filter((cliente) =>
    cliente.nome?.toLowerCase()?.includes(busca.trim().toLowerCase())
  )

  return (
    <div className="min-h-screen bg-(--nos-bg) font-data text-(--nos-text)">

      <div className="flex items-center justify-between border-b border-(--nos-border) px-8 py-5">
        <div>
          <p className="font-ui text-[10px] uppercase tracking-[0.25em] text-(--nos-red)">
            N-OS / CLIENTES
          </p>

          <h1 className="font-ui text-sm uppercase tracking-widest text-(--nos-text)">
            // CLIENTES
          </h1>
        </div>

        <Button variant="secondary" onClick={abrirCriacao}>
          + Novo Cliente
        </Button>
      </div>

      <div className="px-8 py-6">

        <div className="mb-4">
          <SearchInput
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por nome..."
          />
        </div>

        {carregando && (
          <div className="flex items-center justify-center gap-2 py-16 text-xs uppercase tracking-widest text-(--nos-text-faint)">
            <span className="animate-pulse text-(--nos-red)">■</span>
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

            <div className="grid grid-cols-[80px_1fr_140px_180px_100px_150px] border-b border-(--nos-border) bg-(--nos-surface) px-4 py-3">
              {[
                '// ID',
                '// NOME',
                '// TELEFONE',
                '// DOCUMENTO',
                '// STATUS',
                '// AÇÕES'
              ].map((col) => (
                <span
                  key={col}
                  className="font-ui text-[10px] uppercase tracking-[0.15em] text-(--nos-text-faint)"
                >
                  {col}
                </span>
              ))}
            </div>

            {clientesFiltrados.length === 0 && (
              <div className="py-12 text-center text-xs uppercase tracking-widest text-(--nos-text-faint)">
                {busca
                  ? 'Nenhum cliente encontrado para essa busca'
                  : 'Nenhum cliente cadastrado'}
              </div>
            )}

            {clientesFiltrados.map((cliente, indice) => (
              <div
                key={cliente.id}
                className={[
                  'grid grid-cols-[80px_1fr_140px_180px_100px_150px]',
                  'items-center px-4 py-3 transition-colors hover:bg-(--nos-surface-2)',
                  indice !== clientesFiltrados.length - 1
                    ? 'border-b border-(--nos-border)'
                    : '',
                  !cliente.ativo ? 'opacity-40' : '',
                ].join(' ')}
              >

                <span className="font-data text-xs text-(--nos-red)">
                  #{String(cliente.id).padStart(4, '0')}
                </span>

                <div className="pr-4">
                  <span className="block truncate text-xs text-(--nos-text)">
                    {cliente.nome}
                  </span>

                  {cliente.cidade && (
                    <span className="text-[10px] text-(--nos-text-muted)">
                      {cliente.cidade}
                      {cliente.estado ? ` / ${cliente.estado}` : ''}
                    </span>
                  )}
                </div>

                <span className="truncate pr-4 text-xs text-(--nos-text-muted)">
                  {formatarTelefone(cliente.telefone)}
                </span>

                <span className="truncate pr-4 text-xs text-(--nos-text-muted)">
                  {formatarDocumento(
                    cliente.documento,
                    cliente.tipoDocumento
                  )}
                </span>

                <Badge status={cliente.ativo ? 'ativo' : 'inativo'} />

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => abrirEdicao(cliente)}
                  >
                    Editar
                  </Button>

                  <span className="text-(--nos-border-2)">|</span>

                  <Button
                    size="sm"
                    variant="ghost"
                    className={
                      cliente.ativo
                        ? 'hover:!text-(--nos-red)'
                        : 'hover:!text-(--nos-success)'
                    }
                    onClick={() => abrirConfirmacao(cliente)}
                  >
                    {cliente.ativo ? 'Inativar' : 'Reativar'}
                  </Button>
                </div>

              </div>
            ))}

          </div>
        )}

        {!carregando && !erro && clientesFiltrados.length > 0 && (
          <div className="mt-3 flex justify-between text-[10px] uppercase tracking-widest text-(--nos-text-faint)">
            <span>
              {clientesFiltrados.length} cliente(s)
            </span>

            <span>
              {clientesFiltrados.filter((c) => c.ativo).length} ativos
              {' • '}
              {clientesFiltrados.filter((c) => !c.ativo).length} inativos
            </span>
          </div>
        )}

      </div>

      <ClienteModal
        aberto={modalClienteAberto}
        onFechar={() => setModalClienteAberto(false)}
        clienteEdicao={clienteEdicao}
        onSucesso={carregar}
        onAvancar={aoAvancarParaVeiculo}
      />

      <VeiculoModal
        aberto={modalVeiculoAberto}
        onFechar={() => {
          setModalVeiculoAberto(false)
          setClienteWizard(null)
        }}
        clienteWizard={clienteWizard}
        onSucesso={carregar}
        onConcluir={aoConclurirWizard}
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