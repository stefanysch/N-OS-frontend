import { useEffect, useState } from 'react'

import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import SearchInput from '@/components/ui/SearchInput'
import ModalConfirmacao from '@/components/shared/ModalConfirmacao'

import PecaModal from '../components/PecaModal'

import { pecaService } from '../services/pecaService'

import { formatarMoeda } from '@/utils/formatters'

export default function PecaPage() {

  const [pecas, setPecas] = useState([])

  const [busca, setBusca] = useState('')

  const [carregando, setCarregando] =
    useState(true)

  const [erro, setErro] =
    useState(null)

  const [modalAberto,
    setModalAberto] =
    useState(false)

  const [pecaEdicao,
    setPecaEdicao] =
    useState(null)

  const [confirmacaoStatus,
    setConfirmacaoStatus] =
    useState(null)

  const [alterandoStatus,
    setAlterandoStatus] =
    useState(false)

  useEffect(() => {

    carregar()

  }, [])

  async function carregar() {

    setCarregando(true)

    setErro(null)

    try {

      const pecas =
        await pecaService.listar()

      setPecas(
        Array.isArray(pecas)
          ? pecas
          : []
      )

    } catch {

      setErro(
        'Falha ao carregar peças.'
      )

    } finally {

      setCarregando(false)

    }

  }

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

    } catch {

      setErro(
        'Erro ao alterar status da peça.'
      )

    } finally {

      setAlterandoStatus(false)

      setConfirmacaoStatus(null)

    }

  }

  const pecasFiltradas = pecas.filter((peca) =>
    peca.nome?.toLowerCase()?.includes(busca.trim().toLowerCase())
  )

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
            placeholder="Buscar por nome..."
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

          <div className="border border-(--nos-border)">

            <div className="grid grid-cols-[80px_1fr_2fr_120px_100px_150px] border-b border-(--nos-border) bg-(--nos-surface) px-4 py-3">

              {[
                '// ID',
                '// NOME',
                '// DESCRIÇÃO',
                '// VALOR',
                '// STATUS',
                '// AÇÕES'
              ].map((coluna) => (

                <span
                  key={coluna}
                  className="text-[10px] uppercase tracking-[0.15em] text-(--nos-text-muted)"
                >
                  {coluna}
                </span>

              ))}

            </div>

            {pecasFiltradas.length === 0 && (

              <div className="py-12 text-center text-xs uppercase tracking-widest text-(--nos-text-faint)">

                {busca
                  ? 'Nenhuma peça encontrada para essa busca'
                  : 'Nenhuma peça cadastrada'}

              </div>

            )}

            {pecasFiltradas.map((peca, indice) => (

              <div
                key={peca.id}
                className={[
                  'grid grid-cols-[80px_1fr_2fr_120px_100px_150px]',
                  'items-center px-4 py-3',
                  'transition-colors hover:bg-(--nos-surface-2)',
                  indice !== pecasFiltradas.length - 1
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

                  <Button
                    size="sm"
                    variant="ghost"
                    className={
                      peca.ativo
                        ? 'hover:!text-(--nos-red)'
                        : 'hover:!text-emerald-500'
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

        {!carregando &&
          !erro &&
          pecasFiltradas.length > 0 && (

            <div className="mt-3 flex justify-between text-[10px] uppercase tracking-widest text-(--nos-text-faint)">

              <span>

                {pecasFiltradas.length} peça(s)

              </span>

              <span>

                {pecasFiltradas.filter(
                  (peca) => peca.ativo
                ).length} ativas

                {' • '}

                {pecasFiltradas.filter(
                  (peca) => !peca.ativo
                ).length} inativas

              </span>

            </div>

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

    </div>

  )

}