import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import ColunaOrdenavel from '@/components/ui/ColunaOrdenavel'
import Paginacao from '@/components/ui/Paginacao'
import SearchInput from '@/components/ui/SearchInput'
import ModalConfirmacao from '@/components/shared/ModalConfirmacao'
import ModalErro from '@/components/shared/ModalErro'

import ClienteModal from '../components/ClienteModal'
import VeiculoModal from '@/features/veiculos/components/VeiculoModal'

import { clienteService } from '../services/clienteService'
import { useListaPaginada } from '@/hooks/useListaPaginada'
import { formatarDocumento, formatarTelefone } from '@/utils/formatters'
import { obterMensagemErro } from '@/utils/erros'

const ORDENACAO_PADRAO = { sort: 'nome', dir: 'asc' }

const COLUNAS = [
  { rotulo: '// ID' },
  { rotulo: '// NOME', campo: 'nome' },
  { rotulo: '// TELEFONE' },
  { rotulo: '// DOCUMENTO' },
  { rotulo: '// VEÍCULOS' },
  { rotulo: '// STATUS' },
  { rotulo: '// AÇÕES' },
]

export default function ClientePage() {

  const navigate = useNavigate()

  const {
    itens: clientes,
    totalItems,
    totalPages,
    page,
    sort,
    dir,
    busca,
    setBusca,
    ordenarPor,
    irParaPagina,
    carregando,
    atualizando,
    erro,
    recarregar: carregar,
  } = useListaPaginada({
    buscar: clienteService.listarPaginado,
    ordenacaoPadrao: ORDENACAO_PADRAO,
  })

  // ─── modal cliente (criação) ──────────────────────────────────────────────
  const [modalClienteAberto, setModalClienteAberto] = useState(false)

  // ─── modal veículo (wizard) ───────────────────────────────────────────────
  const [modalVeiculoAberto, setModalVeiculoAberto] = useState(false)
  const [clienteWizard, setClienteWizard] = useState(null)

  // ─── confirmação de status ────────────────────────────────────────────────
  const [confirmacaoStatus, setConfirmacaoStatus] = useState(null)
  const [alterandoStatus, setAlterandoStatus] = useState(false)
  const [erroAcao, setErroAcao] = useState(null)

  // abre modal de criação — fluxo wizard
  function abrirCriacao() {
    setModalClienteAberto(true)
  }

  function abrirDetalhe(cliente) {
    navigate(`/clientes/${cliente.id}`)
  }

  function abrirVeiculos(cliente) {
    navigate(`/clientes/${cliente.id}?aba=veiculos`)
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
    navigate('/ordens/nova', { state: { cliente, veiculo } })
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
    } catch (erro) {
      setErroAcao(obterMensagemErro(erro?.response?.data, 'Erro ao alterar status do cliente.'))
    } finally {
      setAlterandoStatus(false)
      setConfirmacaoStatus(null)
    }
  }

  return (
    <div className="min-h-screen bg-(--nos-bg) font-mono text-(--nos-text)">

      <div className="flex items-center justify-between border-b border-(--nos-border) px-8 py-5">
        <div>
          <p className="text-[10px] uppercase tracking-[0.25em] text-(--nos-red)">
            N-OS / CLIENTES
          </p>

          <h1 className="text-sm uppercase tracking-widest text-(--nos-text)">
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
            placeholder="Buscar por nome, documento, telefone ou e-mail..."
          />
        </div>

        {carregando && (
          <div className="flex items-center justify-center gap-2 py-16 text-xs uppercase tracking-widest text-(--nos-text-muted)">
            <span className="animate-pulse text-(--nos-red)">■</span>
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
          <div className={[
            'border border-(--nos-border) transition-opacity',
            atualizando ? 'opacity-60' : '',
          ].join(' ')}>

            <div className="grid grid-cols-[80px_1fr_140px_180px_100px_100px_150px] border-b border-(--nos-border) bg-(--nos-surface) px-4 py-3">
              {COLUNAS.map((coluna) => (
                <ColunaOrdenavel
                  key={coluna.rotulo}
                  rotulo={coluna.rotulo}
                  campo={coluna.campo}
                  sort={sort}
                  dir={dir}
                  onOrdenar={ordenarPor}
                  className="text-(--nos-text-muted)"
                />
              ))}
            </div>

            {clientes.length === 0 && (
              <div className="py-12 text-center text-xs uppercase tracking-widest text-(--nos-text-faint)">
                {busca
                  ? 'Nenhum cliente encontrado para essa busca'
                  : 'Nenhum cliente cadastrado'}
              </div>
            )}

            {clientes.map((cliente, indice) => (
              <div
                key={cliente.id}
                onClick={cliente.ativo ? () => abrirDetalhe(cliente) : undefined}
                className={[
                  'grid grid-cols-[80px_1fr_140px_180px_100px_100px_150px]',
                  'items-center px-4 py-3',
                  cliente.ativo
                    ? 'cursor-pointer transition-colors hover:bg-(--nos-surface-2)'
                    : 'cursor-default',
                  indice !== clientes.length - 1
                    ? 'border-b border-(--nos-border)'
                    : '',
                  !cliente.ativo ? 'opacity-40' : '',
                ].join(' ')}
              >

                <span className="font-mono text-xs text-(--nos-red)">
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
                  {formatarDocumento(cliente.documento)}
                </span>

                {cliente.ativo && cliente.quantidadeVeiculos > 0 ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      abrirVeiculos(cliente)
                    }}
                    className="w-fit text-left text-xs text-(--nos-text) underline decoration-(--nos-border-2) underline-offset-4 transition-colors hover:text-(--nos-red) hover:decoration-(--nos-red)"
                  >
                    {cliente.quantidadeVeiculos}
                  </button>
                ) : (
                  <span className="text-xs text-(--nos-text-muted)">
                    {cliente.quantidadeVeiculos}
                  </span>
                )}

                <Badge status={cliente.ativo ? 'ativo' : 'inativo'} />

                <div
                  className="flex items-center gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
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

        {!carregando && !erro && totalItems > 0 && (
          <Paginacao
            page={page}
            totalPages={totalPages}
            totalItems={totalItems}
            rotulo="cliente(s)"
            onMudar={irParaPagina}
          />
        )}

      </div>

      <ClienteModal
        aberto={modalClienteAberto}
        onFechar={() => setModalClienteAberto(false)}
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

      <ModalErro
        aberto={Boolean(erroAcao)}
        mensagem={erroAcao}
        onFechar={() => setErroAcao(null)}
      />

    </div>
  )
}