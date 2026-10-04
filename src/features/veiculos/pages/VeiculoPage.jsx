import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import ColunaOrdenavel from '@/components/ui/ColunaOrdenavel'
import Paginacao from '@/components/ui/Paginacao'
import SearchInput from '@/components/ui/SearchInput'
import ModalConfirmacao from '@/components/shared/ModalConfirmacao'
import ModalErro from '@/components/shared/ModalErro'

import VeiculoModal from '../components/VeiculoModal'

import { veiculoService } from '../services/veiculoService'
import { useListaPaginada } from '@/hooks/useListaPaginada'
import { formatarPlaca } from '@/utils/formatters'
import { obterMensagemErro } from '@/utils/erros'

const ORDENACAO_PADRAO = { sort: 'placa', dir: 'asc' }

const COLUNAS = [
  { rotulo: '// ID' },
  { rotulo: '// CLIENTE', campo: 'cliente' },
  { rotulo: '// PLACA', campo: 'placa' },
  { rotulo: '// MODELO', campo: 'modelo' },
  { rotulo: '// ANO', campo: 'ano' },
  { rotulo: '// STATUS' },
  { rotulo: '// AÇÕES' },
]

export default function VeiculoPage() {

  const navigate = useNavigate()

  const {
    itens: veiculos,
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
    buscar: veiculoService.listarPaginado,
    ordenacaoPadrao: ORDENACAO_PADRAO,
  })

  const [modalAberto, setModalAberto] = useState(false)
  const [confirmacaoStatus, setConfirmacaoStatus] = useState(null)
  const [alterandoStatus, setAlterandoStatus] = useState(false)
  const [erroAcao, setErroAcao] = useState(null)

  function abrirCriacao() {
    setModalAberto(true)
  }

  function abrirDetalhe(veiculo) {
    navigate(`/veiculos/${veiculo.id}`)
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
    } catch (erro) {
      setErroAcao(obterMensagemErro(erro?.response?.data, 'Erro ao alterar status do veículo.'))
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
            N-OS / VEÍCULOS
          </p>

          <h1 className="text-sm uppercase tracking-widest text-(--nos-text)">
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
            placeholder="Buscar por placa, modelo ou cliente..."
          />
        </div>

        {carregando && (
          <div className="flex items-center justify-center gap-2 py-16 text-xs uppercase tracking-widest text-(--nos-text-muted)">
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
          <div className={[
            'border border-(--nos-border) transition-opacity',
            atualizando ? 'opacity-60' : '',
          ].join(' ')}>

            <div className="grid grid-cols-[80px_1fr_120px_1fr_80px_100px_150px] border-b border-(--nos-border) bg-(--nos-surface) px-4 py-3">

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

            {veiculos.length === 0 && (
              <div className="py-12 text-center text-xs uppercase tracking-widest text-(--nos-text-faint)">
                {busca
                  ? 'Nenhum veículo encontrado para essa busca'
                  : 'Nenhum veículo cadastrado'}
              </div>
            )}

            {veiculos.map((veiculo, indice) => (
              <div
                key={veiculo.id}
                onClick={veiculo.ativo ? () => abrirDetalhe(veiculo) : undefined}
                className={[
                  'grid grid-cols-[80px_1fr_120px_1fr_80px_100px_150px]',
                  'items-center px-4 py-3',
                  veiculo.ativo
                    ? 'cursor-pointer transition-colors hover:bg-(--nos-surface-2)'
                    : 'cursor-default',
                  indice !== veiculos.length - 1
                    ? 'border-b border-(--nos-border)'
                    : '',
                  !veiculo.ativo ? 'opacity-40' : '',
                ].join(' ')}
              >

                <span className="font-mono text-xs text-(--nos-red)">
                  #{String(veiculo.id).padStart(4, '0')}
                </span>

                <div className="pr-4">

                  <span className="block truncate text-xs text-(--nos-text)">
                    {veiculo.clienteNome || '—'}
                  </span>

                  <span className="text-[10px] text-(--nos-text-muted)">
                    #{String(veiculo.clienteId).padStart(4, '0')}
                  </span>

                </div>

                <span className="font-mono text-xs tracking-widest text-(--nos-text)">
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
                  {veiculo.ano || '—'}
                </span>

                <Badge
                  status={
                    veiculo.ativo
                      ? 'ativo'
                      : 'inativo'
                  }
                />

                <div
                  className="flex items-center gap-2"
                  onClick={(e) => e.stopPropagation()}
                >

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

        {!carregando && !erro && totalItems > 0 && (
          <Paginacao
            page={page}
            totalPages={totalPages}
            totalItems={totalItems}
            rotulo="veículo(s)"
            onMudar={irParaPagina}
          />
        )}

      </div>

      <VeiculoModal
        aberto={modalAberto}
        onFechar={() => setModalAberto(false)}
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

      <ModalErro
        aberto={Boolean(erroAcao)}
        mensagem={erroAcao}
        onFechar={() => setErroAcao(null)}
      />

    </div>
  )
}