import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import ColunaOrdenavel from '@/components/ui/ColunaOrdenavel'
import Paginacao from '@/components/ui/Paginacao'
import SearchInput from '@/components/ui/SearchInput'
import ModalConfirmacao from '@/components/shared/ModalConfirmacao'
import ModalErro from '@/components/shared/ModalErro'

import { statusOSParaPreset } from '@/utils/statusOS'

import { ordemDeServicoService } from '../services/ordemDeServicoService'
import { useListaPaginada } from '@/hooks/useListaPaginada'
import { formatarData, formatarMoeda, formatarPlaca } from '@/utils/formatters'
import { obterMensagemErro } from '@/utils/erros'

const ORDENACAO_PADRAO = { sort: 'dataAbertura', dir: 'desc' }

const COLUNAS = [
  { rotulo: '// ID' },
  { rotulo: '// CLIENTE', campo: 'cliente' },
  { rotulo: '// VEÍCULO', campo: 'placa' },
  { rotulo: '// ABERTURA', campo: 'dataAbertura' },
  { rotulo: '// STATUS', campo: 'status' },
  { rotulo: '// TOTAL', campo: 'valorTotal' },
  { rotulo: '// AÇÕES' },
]

export default function OrdemDeServicoPage() {
  const navigate = useNavigate()

  const {
    itens: ordens,
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
    buscar: ordemDeServicoService.listarPaginado,
    ordenacaoPadrao: ORDENACAO_PADRAO,
  })

  const [confirmacaoStatus, setConfirmacaoStatus] = useState(null)
  const [alterandoStatus, setAlterandoStatus] = useState(false)
  const [erroAcao, setErroAcao] = useState(null)

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
    } catch (erro) {
      setErroAcao(obterMensagemErro(erro?.response?.data, 'Erro ao alterar status da ordem de serviço.'))
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
          <div className={[
            'border border-(--nos-border) transition-opacity',
            atualizando ? 'opacity-60' : '',
          ].join(' ')}>

            <div className="grid grid-cols-[80px_1fr_1fr_110px_140px_110px_150px] border-b border-(--nos-border) bg-(--nos-surface) px-4 py-3">

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

            {ordens.length === 0 && (
              <div className="py-12 text-center text-xs uppercase tracking-widest text-(--nos-text-faint)">
                {busca
                  ? 'Nenhuma ordem de serviço encontrada para essa busca'
                  : 'Nenhuma ordem de serviço cadastrada'}
              </div>
            )}

            {ordens.map((ordem, indice) => {
              return (
                <div
                  key={ordem.id}
                  onClick={
                    ordem.ativo
                      ? () => navigate(`/ordens/${ordem.id}/editar`)
                      : undefined
                  }
                  className={[
                    'grid grid-cols-[80px_1fr_1fr_110px_140px_110px_150px]',
                    'items-center px-4 py-3',
                    ordem.ativo
                      ? 'cursor-pointer transition-colors hover:bg-(--nos-surface-2)'
                      : 'cursor-default',
                    indice !== ordens.length - 1
                      ? 'border-b border-(--nos-border)'
                      : '',
                    !ordem.ativo ? 'opacity-40' : '',
                  ].join(' ')}
                >

                  <span className="font-mono text-xs text-(--nos-red)">
                    #{String(ordem.id).padStart(4, '0')}
                  </span>

                  <span className="truncate pr-4 text-xs text-(--nos-text)">
                    {ordem.clienteNome || '—'}
                  </span>

                  <span className="truncate pr-4 text-xs text-(--nos-text-muted)">
                    {formatarPlaca(ordem.placa)}
                  </span>

                  <span className="text-xs text-(--nos-text-muted)">
                    {formatarData(ordem.dataAbertura)}
                  </span>

                  <Badge status={statusOSParaPreset(ordem.status)} />

                  <span className="text-xs text-(--nos-text)">
                    {formatarMoeda(ordem.valorTotal)}
                  </span>

                  <div
                    className="flex items-center gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        window.open(`/ordens/${ordem.id}/imprimir`, '_blank')
                      }
                    >
                      PDF
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

        {!carregando && !erro && totalItems > 0 && (
          <Paginacao
            page={page}
            totalPages={totalPages}
            totalItems={totalItems}
            rotulo="ordem(ns)"
            onMudar={irParaPagina}
          />
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

      <ModalErro
        aberto={Boolean(erroAcao)}
        mensagem={erroAcao}
        onFechar={() => setErroAcao(null)}
      />

    </div>
  )
}
