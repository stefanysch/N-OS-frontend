import { useState } from 'react'

import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import ColunaOrdenavel from '@/components/ui/ColunaOrdenavel'
import Paginacao from '@/components/ui/Paginacao'
import SearchInput from '@/components/ui/SearchInput'
import ModalConfirmacao from '@/components/shared/ModalConfirmacao'
import ModalErro from '@/components/shared/ModalErro'

import PecaModal from '../components/PecaModal'

import { pecaService } from '../services/pecaService'

import { useListaPaginada } from '@/hooks/useListaPaginada'
import { formatarMoeda } from '@/utils/formatters'
import { obterMensagemErro } from '@/utils/erros'

const ORDENACAO_PADRAO = { sort: 'nome', dir: 'asc' }

const COLUNAS = [
  { rotulo: '// ID' },
  { rotulo: '// NOME', campo: 'nome' },
  { rotulo: '// DESCRIÇÃO' },
  { rotulo: '// VALOR', campo: 'valor' },
  { rotulo: '// STATUS' },
  { rotulo: '// AÇÕES' },
]

export default function PecaPage() {

  const {
    itens: pecas,
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
    buscar: pecaService.listarPaginado,
    ordenacaoPadrao: ORDENACAO_PADRAO,
  })

  const [modalAberto, setModalAberto] = useState(false)
  const [pecaEdicao, setPecaEdicao] = useState(null)
  const [confirmacaoStatus, setConfirmacaoStatus] = useState(null)
  const [alterandoStatus, setAlterandoStatus] = useState(false)
  const [erroAcao, setErroAcao] = useState(null)

  function abrirCriacao() {
    setPecaEdicao(null)
    setModalAberto(true)
  }

  function abrirEdicao(peca) {
    setPecaEdicao(peca)
    setModalAberto(true)
  }

  function abrirConfirmacao(peca) {
    setConfirmacaoStatus({
      id: peca.id,
      ativo: peca.ativo,
      mensagem: peca.ativo
        ? `Deseja inativar "${peca.nome}"?`
        : `Deseja reativar "${peca.nome}"?`
    })
  }

  async function confirmarAlteracaoStatus() {

    setAlterandoStatus(true)

    try {

      if (confirmacaoStatus.ativo) {

        await pecaService.inativar(
          confirmacaoStatus.id
        )

      } else {

        await pecaService.reativar(
          confirmacaoStatus.id
        )

      }

      await carregar()
    } catch (erro) {
      setErroAcao(
        obterMensagemErro(erro?.response?.data, 'Erro ao alterar status da peça.')
      )

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
            N-OS / PEÇAS
          </p>

          <h1 className="text-sm uppercase tracking-widest text-(--nos-text)">
            // PEÇAS
          </h1>

        </div>

        <Button
          variant="secondary"
          onClick={abrirCriacao}
        >
          + Nova Peça
        </Button>

      </div>

      <div className="px-8 py-6">

        <div className="mb-4">
          <SearchInput
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por nome ou descrição..."
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

            <div className="grid grid-cols-[80px_1fr_2fr_120px_100px_150px] border-b border-(--nos-border) bg-(--nos-surface) px-4 py-3">

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

            {pecas.length === 0 && (

              <div className="py-12 text-center text-xs uppercase tracking-widest text-(--nos-text-faint)">

                {busca
                  ? 'Nenhuma peça encontrada para essa busca'
                  : 'Nenhuma peça cadastrada'}

              </div>

            )}

            {pecas.map((peca, indice) => (

              <div
                key={peca.id}
                className={[
                  'grid grid-cols-[80px_1fr_2fr_120px_100px_150px]',
                  'items-center px-4 py-3',
                  'transition-colors hover:bg-(--nos-surface-2)',
                  indice !== pecas.length - 1
                    ? 'border-b border-(--nos-border)'
                    : '',
                  !peca.ativo
                    ? 'opacity-40'
                    : ''
                ].join(' ')}
              >

                <span className="font-mono text-xs text-(--nos-red)">

                  #{String(peca.id).padStart(4, '0')}

                </span>

                <span className="truncate pr-4 text-xs text-(--nos-text)">

                  {peca.nome}

                </span>

                <span className="truncate pr-4 text-xs text-(--nos-text-muted)">

                  {peca.descricao || '—'}

                </span>

                <span className="text-xs text-(--nos-text)">

                  {formatarMoeda(peca.valor)}

                </span>

                <Badge
                  status={
                    peca.ativo
                      ? 'ativo'
                      : 'inativo'
                  }
                />

                <div className="flex items-center gap-2">

                  {peca.ativo && (
                    <>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => abrirEdicao(peca)}
                      >
                        Editar
                      </Button>

                      <span className="text-(--nos-text-faint)">
                        |
                      </span>
                    </>
                  )}

                  <Button
                    size="sm"
                    variant="ghost"
                    className={
                      peca.ativo
                        ? 'hover:!text-(--nos-red)'
                        : 'hover:!text-(--nos-success)'
                    }
                    onClick={() => abrirConfirmacao(peca)}
                  >
                    {peca.ativo
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
            rotulo="peça(s)"
            onMudar={irParaPagina}
          />

        )}

      </div>

      <PecaModal
        aberto={modalAberto}
        onFechar={() =>
          setModalAberto(false)
        }
        pecaEdicao={pecaEdicao}
        onSucesso={carregar}
      />

      <ModalConfirmacao
        aberto={Boolean(confirmacaoStatus)}
        mensagem={confirmacaoStatus?.mensagem}
        carregando={alterandoStatus}
        onConfirmar={confirmarAlteracaoStatus}
        onCancelar={() =>
          setConfirmacaoStatus(null)
        }
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