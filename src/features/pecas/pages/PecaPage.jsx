import { useEffect, useState } from 'react'

import Button from '@/components/ui/Button'

import PecaModal from '../components/PecaModal'
import ModalConfirmacao from '@/components/shared/ModalConfirmacao'

import { pecaService } from '../services/pecaService'

import { formatarMoeda } from '@/utils/formatters'



export default function PecaPage() {

  const [pecas, setPecas] = useState([])

  const [carregando, setCarregando] =
    useState(true)

  const [erroCarregamento, setErroCarregamento] =
    useState(null)



  const [modalFormularioAberto,
    setModalFormularioAberto] =
    useState(false)

  const [pecaEdicao, setPecaEdicao] =
    useState(null)



  const [modalConfirmacao, setModalConfirmacao] =
    useState(null)

  const [excluindoPeca, setExcluindoPeca] =
    useState(false)



  useEffect(() => {

    carregarPecas()

  }, [])



  async function carregarPecas() {

    setCarregando(true)

    setErroCarregamento(null)

    try {

      const listaPecas =
        await pecaService.listar()

      const pecasAtivas =
        listaPecas.filter(
          (peca) => peca.ativo
        )

      setPecas(pecasAtivas)

    } catch {

      setErroCarregamento(
        'Falha ao carregar peças.'
      )

    } finally {

      setCarregando(false)
    }
  }



  function handleAbrirCriacao() {

    setPecaEdicao(null)

    setModalFormularioAberto(true)
  }



  function handleAbrirEdicao(peca) {

    setPecaEdicao(peca)

    setModalFormularioAberto(true)
  }



  function handleAbrirConfirmacao(peca) {

    setModalConfirmacao({
      id: peca.id,
      mensagem: `Deseja deletar "${peca.nome}"?`
    })
  }



  async function handleExcluirPeca() {

    setExcluindoPeca(true)

    try {

      await pecaService.inativar(
        modalConfirmacao.id
      )

      setPecas((listaAtual) =>
        listaAtual.filter(
          (peca) =>
            peca.id !== modalConfirmacao.id
        )
      )

    } catch {

      alert('Erro ao deletar peça.')

    } finally {

      setExcluindoPeca(false)

      setModalConfirmacao(null)
    }
  }



  return (
    <div className="min-h-screen bg-[#0d0d0d] font-mono text-white">

      <div className="flex items-center justify-between border-b border-[#1e1e1e] px-8 py-5">

        <div>

          <p className="text-[10px] uppercase tracking-[0.25em] text-[#e11d48]">
            N-OS / PEÇAS
          </p>

          <h1 className="text-sm uppercase tracking-widest text-white">
            // PEÇAS
          </h1>

        </div>

        <Button
          variant="secondary"
          onClick={handleAbrirCriacao}
        >
          + Nova Peça
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
              onClick={carregarPecas}
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



            {pecas.length === 0 && (

              <div className="py-12 text-center text-xs uppercase tracking-widest text-[#333]">

                Nenhuma peça cadastrada

              </div>
            )}



            {pecas.map((peca, index) => (

              <div
                key={peca.id}
                className={[
                  'grid grid-cols-[80px_1fr_2fr_120px_120px]',
                  'items-center px-4 py-3',
                  'transition-colors hover:bg-[#161616]',
                  index !== pecas.length - 1
                    ? 'border-b border-[#1a1a1a]'
                    : ''
                ].join(' ')}
              >

                <span className="font-mono text-xs text-[#e11d48]">

                  #{String(peca.id).padStart(4, '0')}

                </span>



                <span className="truncate pr-4 text-xs text-white">

                  {peca.nome}

                </span>



                <span className="truncate pr-4 text-xs text-[#555]">

                  {peca.descricao || '—'}

                </span>



                <span className="text-xs text-white">

                  {formatarMoeda(peca.valor)}

                </span>



                <div className="flex items-center gap-2">

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      handleAbrirEdicao(peca)
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
                      handleAbrirConfirmacao(peca)
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
          pecas.length > 0 && (

          <div className="mt-3 flex justify-between text-[10px] uppercase tracking-widest text-[#333]">

            <span>
              {pecas.length} peça(s)
            </span>

            <span>
              {pecas.length} ativas
            </span>

          </div>
        )}

      </div>



      <PecaModal
        aberto={modalFormularioAberto}
        onFechar={() =>
          setModalFormularioAberto(false)
        }
        pecaEdicao={pecaEdicao}
        onSucesso={carregarPecas}
      />



      <ModalConfirmacao
        aberto={Boolean(modalConfirmacao)}
        mensagem={modalConfirmacao?.mensagem}
        carregando={excluindoPeca}
        onConfirmar={handleExcluirPeca}
        onCancelar={() =>
          setModalConfirmacao(null)
        }
      />

    </div>
  )
}