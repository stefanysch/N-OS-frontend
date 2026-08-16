import { useEffect, useState } from 'react'

import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import SearchInput from '@/components/ui/SearchInput'
import ModalConfirmacao from '@/components/shared/ModalConfirmacao'

import ServicoModal from '../components/ServicoModal'

import { servicoService } from '../services/servicoService'

import { formatarMoeda } from '@/utils/formatters'

export default function ServicoPage() {

  const [servicos, setServicos] =
    useState([])

  const [busca, setBusca] =
    useState('')

  const [carregando, setCarregando] =
    useState(true)

  const [erro, setErro] =
    useState(null)

  const [modalAberto, setModalAberto] =
    useState(false)

  const [servicoEdicao, setServicoEdicao] =
    useState(null)

  const [confirmacao, setConfirmacao] =
    useState(null)

  const [alterandoStatus, setAlterandoStatus] =
    useState(false)

  async function carregar() {

    setCarregando(true)
    setErro(null)

    try {

      const resposta =
        await servicoService.listar()

      setServicos(
        Array.isArray(resposta)
          ? resposta
          : []
      )

    } catch {

      setErro(
        'Falha ao carregar serviços.'
      )

    } finally {

      setCarregando(false)

    }
  }

  useEffect(() => {

    carregar()

  }, [])

  function abrirCriacao() {

    setServicoEdicao(null)

    setModalAberto(true)

  }

  function abrirEdicao(servico) {

    setServicoEdicao(servico)

    setModalAberto(true)

  }

  function pedirConfirmacaoStatus(servico) {

    setConfirmacao({

      id: servico.id,

      ativo: servico.ativo,

      mensagem: servico.ativo
        ? `Deseja inativar "${servico.nome}"?`
        : `Deseja reativar "${servico.nome}"?`

    })
  }

  async function alterarStatus() {

    setAlterandoStatus(true)

    try {

      if (confirmacao.ativo) {

        await servicoService.inativar(
          confirmacao.id
        )

      } else {

        await servicoService.reativar(
          confirmacao.id
        )

      }

      await carregar()

    } catch {

      alert(
        'Erro ao alterar status do serviço.'
      )

    } finally {

      setAlterandoStatus(false)

      setConfirmacao(null)

    }
  }

  const servicosFiltrados = servicos.filter((servico) =>
    servico.nome?.toLowerCase()?.includes(busca.trim().toLowerCase())
  )

  return (

    <div className="min-h-screen bg-(--nos-bg) font-mono text-(--nos-text)">

      <div className="flex items-center justify-between border-b border-(--nos-border) px-8 py-5">

        <div>

          <p className="text-[10px] uppercase tracking-[0.25em] text-(--nos-red)">
            N-OS / SERVIÇOS
          </p>

          <h1 className="text-sm uppercase tracking-widest text-(--nos-text)">
            // SERVIÇOS
          </h1>

        </div>

        <Button
          variant="secondary"
          onClick={abrirCriacao}
        >
          + Novo Serviço
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
              ].map(coluna => (

                <span
                  key={coluna}
                  className="text-[10px] uppercase tracking-[0.15em] text-(--nos-text-muted)"
                >
                  {coluna}
                </span>

              ))}

            </div>

            {servicosFiltrados.length === 0 && (

              <div className="py-12 text-center text-xs uppercase tracking-widest text-(--nos-text-faint)">

                {busca
                  ? 'Nenhum serviço encontrado para essa busca'
                  : 'Nenhum serviço cadastrado'}

              </div>

            )}

            {servicosFiltrados.map((servico, index) => (

              <div
                key={servico.id}
                className={[
                  'grid grid-cols-[80px_1fr_2fr_120px_100px_150px]',
                  'items-center px-4 py-3',
                  'transition-colors hover:bg-(--nos-surface-2)',
                  index !== servicosFiltrados.length - 1
                    ? 'border-b border-(--nos-border)'
                    : '',
                  !servico.ativo
                    ? 'opacity-40'
                    : ''
                ].join(' ')}
              >

                <span className="font-mono text-xs text-(--nos-red)">
                  #{String(servico.id).padStart(4, '0')}
                </span>

                <span className="truncate pr-4 text-xs text-(--nos-text)">
                  {servico.nome}
                </span>

                <span className="truncate pr-4 text-xs text-(--nos-text-muted)">
                  {servico.descricao || '—'}
                </span>

                <span className="text-xs text-(--nos-text)">
                  {formatarMoeda(servico.valor)}
                </span>

                <Badge
                  status={
                    servico.ativo
                      ? 'ativo'
                      : 'inativo'
                  }
                />

                <div className="flex items-center gap-2">

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      abrirEdicao(servico)
                    }
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
                      servico.ativo
                        ? 'hover:!text-(--nos-red)'
                        : 'hover:!text-emerald-500'
                    }
                    onClick={() =>
                      pedirConfirmacaoStatus(servico)
                    }
                  >
                    {servico.ativo
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
          servicosFiltrados.length > 0 && (

          <div className="mt-3 flex justify-between text-[10px] uppercase tracking-widest text-(--nos-text-faint)">

            <span>

              {servicosFiltrados.length} serviço(s)

            </span>

            <span>

              {servicosFiltrados.filter(
                servico => servico.ativo
              ).length} ativos

              {' • '}

              {servicosFiltrados.filter(
                servico => !servico.ativo
              ).length} inativos

            </span>

          </div>

        )}

      </div>

      <ServicoModal
        aberto={modalAberto}
        onFechar={() =>
          setModalAberto(false)
        }
        servicoEdicao={servicoEdicao}
        onSucesso={carregar}
      />

      <ModalConfirmacao
        aberto={Boolean(confirmacao)}
        mensagem={confirmacao?.mensagem}
        carregando={alterandoStatus}
        onConfirmar={alterarStatus}
        onCancelar={() =>
          setConfirmacao(null)
        }
        textoBotao={
          confirmacao?.ativo
            ? 'Inativar'
            : 'Reativar'
        }
        varianteBotao={
          confirmacao?.ativo
            ? 'danger'
            : 'secondary'
        }
      />

    </div>

  )
}