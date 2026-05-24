import { useEffect, useState } from 'react'

import Button from '@/components/ui/Button'

import ServicoModal from '../components/ServicoModal'
import ModalConfirmacao from '@/components/shared/ModalConfirmacao'

import { servicoService } from '../services/servicoService'

import { formatarMoeda } from '@/utils/formatters'



export default function ServicoPage() {

  const [servicos, setServicos] =
    useState([])

  const [carregando, setCarregando] =
    useState(true)

  const [erroCarregamento, setErroCarregamento] =
    useState(null)



  const [modalFormularioAberto,
    setModalFormularioAberto] =
    useState(false)

  const [servicoEdicao, setServicoEdicao] =
    useState(null)



  const [modalConfirmacao, setModalConfirmacao] =
    useState(null)

  const [excluindoServico, setExcluindoServico] =
    useState(false)



  useEffect(() => {

    carregarServicos()

  }, [])



  async function carregarServicos() {

    setCarregando(true)

    setErroCarregamento(null)

    try {

      const listaServicos =
        await servicoService.listar()

      const servicosAtivos =
        listaServicos.filter(
          (servico) => servico.ativo
        )

      setServicos(servicosAtivos)

    } catch {

      setErroCarregamento(
        'Falha ao carregar serviços.'
      )

    } finally {

      setCarregando(false)
    }
  }



  function handleAbrirCriacao() {

    setServicoEdicao(null)

    setModalFormularioAberto(true)
  }



  function handleAbrirEdicao(servico) {

    setServicoEdicao(servico)

    setModalFormularioAberto(true)
  }



  function handleAbrirConfirmacao(servico) {

    setModalConfirmacao({
      id: servico.id,
      mensagem: `Deseja deletar "${servico.nome}"?`
    })
  }



  async function handleExcluirServico() {

    setExcluindoServico(true)

    try {

      await servicoService.inativar(
        modalConfirmacao.id
      )

      setServicos((listaAtual) =>
        listaAtual.filter(
          (servico) =>
            servico.id !== modalConfirmacao.id
        )
      )

    } catch {

      alert('Erro ao deletar serviço.')

    } finally {

      setExcluindoServico(false)

      setModalConfirmacao(null)
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
          onClick={handleAbrirCriacao}
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



        {erroCarregamento && !carregando && (

          <div className="border border-[#e11d48]/30 bg-[#e11d48]/10 px-4 py-3">

            <p className="font-mono text-xs text-[#e11d48]">
              {erroCarregamento}
            </p>

            <Button
              variant="ghost"
              size="sm"
              className="mt-2"
              onClick={carregarServicos}
            >
              Tentar novamente
            </Button>

          </div>
        )}



        {!carregando && !erroCarregamento && (

          <div className="border border-[#1e1e1e]">

            <div className="grid grid-cols-[80px_1fr_2fr_130px_120px] border-b border-[#1e1e1e] bg-[#111] px-4 py-3">

              {[
                '// ID',
                '// NOME',
                '// DESCRIÇÃO',
                '// VALOR',
                '// AÇÕES'
              ].map((coluna) => (

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
                  'grid grid-cols-[80px_1fr_2fr_120px_120px]',
                  'items-center px-4 py-3',
                  'transition-colors hover:bg-[#161616]',
                  index !== servicos.length - 1
                    ? 'border-b border-[#1a1a1a]'
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



                <div className="flex items-center gap-2">

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      handleAbrirEdicao(servico)
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
                    className="hover:!text-[#e11d48]"
                    onClick={() =>
                      handleAbrirConfirmacao(servico)
                    }
                  >
                    Deletar
                  </Button>

                </div>
              </div>
            ))}
          </div>
        )}



        {!carregando &&
          !erroCarregamento &&
          servicos.length > 0 && (

          <div className="mt-3 flex justify-between text-[10px] uppercase tracking-widest text-[#333]">

            <span>
              {servicos.length} serviço(s)
            </span>

            <span>
              {servicos.length} ativos
            </span>

          </div>
        )}

      </div>



      <ServicoModal
        aberto={modalFormularioAberto}
        onFechar={() =>
          setModalFormularioAberto(false)
        }
        servicoEdicao={servicoEdicao}
        onSucesso={carregarServicos}
      />



      <ModalConfirmacao
        aberto={Boolean(modalConfirmacao)}
        mensagem={modalConfirmacao?.mensagem}
        carregando={excluindoServico}
        onConfirmar={handleExcluirServico}
        onCancelar={() =>
          setModalConfirmacao(null)
        }
      />

    </div>
  )
}