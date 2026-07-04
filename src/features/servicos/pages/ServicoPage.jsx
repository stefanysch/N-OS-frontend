import { useEffect, useState } from 'react'

import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import ModalConfirmacao from '@/components/shared/ModalConfirmacao'

import ServicoModal from '../components/ServicoModal'

import { servicoService } from '../services/servicoService'

import { formatarMoeda } from '@/utils/formatters'

export default function ServicoPage() {

  const [servicos, setServicos] =
    useState([])

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

  return (

    <div className="min-h-screen bg-[#0d0d0d] font-mono text-white">

      <div className="flex items-center justify-between border-b border-[#1e1e1e] px-8 py-5">

        <div>

          <p className="text-[10px] uppercase tracking-[0.25em] text-[#e11d48]">
            N-OS / SERVIÇOS
          </p>

          <h1 className="text-sm uppercase tracking-widest text-white">
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

        {carregando && (

          <div className="flex items-center justify-center gap-2 py-16 text-xs uppercase tracking-widest text-[#444]">

            <span className="animate-pulse text-[#e11d48]">
              ■
            </span>

            Carregando...

          </div>

        )}

        {erro && !carregando && (

          <div className="border border-[#e11d48]/30 bg-[#e11d48]/10 px-4 py-3">

            <p className="font-mono text-xs text-[#e11d48]">
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

          <div className="border border-[#1e1e1e]">

            <div className="grid grid-cols-[80px_1fr_2fr_120px_100px_150px] border-b border-[#1e1e1e] bg-[#111] px-4 py-3">

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
                  className="text-[10px] uppercase tracking-[0.15em] text-[#444]"
                >
                  {coluna}
                </span>

              ))}

            </div>

            {servicos.length === 0 && (

              <div className="py-12 text-center text-xs uppercase tracking-widest text-[#333]">

                Nenhum serviço cadastrado

              </div>

            )}

            {servicos.map((servico, index) => (

              <div
                key={servico.id}
                className={[
                  'grid grid-cols-[80px_1fr_2fr_120px_100px_150px]',
                  'items-center px-4 py-3',
                  'transition-colors hover:bg-[#161616]',
                  index !== servicos.length - 1
                    ? 'border-b border-[#1a1a1a]'
                    : '',
                  !servico.ativo
                    ? 'opacity-40'
                    : ''
                ].join(' ')}
              >

                <span className="font-mono text-xs text-[#e11d48]">
                  #{String(servico.id).padStart(4, '0')}
                </span>

                <span className="truncate pr-4 text-xs text-white">
                  {servico.nome}
                </span>

                <span className="truncate pr-4 text-xs text-[#555]">
                  {servico.descricao || '—'}
                </span>

                <span className="text-xs text-white">
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

                  <span className="text-[#222]">
                    |
                  </span>

                  <Button
                    size="sm"
                    variant="ghost"
                    className={
                      servico.ativo
                        ? 'hover:!text-[#e11d48]'
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
          servicos.length > 0 && (

          <div className="mt-3 flex justify-between text-[10px] uppercase tracking-widest text-[#333]">

            <span>

              {servicos.length} serviço(s)

            </span>

            <span>

              {servicos.filter(
                servico => servico.ativo
              ).length} ativos

              {' • '}

              {servicos.filter(
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