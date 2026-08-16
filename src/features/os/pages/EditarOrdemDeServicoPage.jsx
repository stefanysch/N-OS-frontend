import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import Button from '@/components/ui/Button'
import ModalConfirmacao from '@/components/shared/ModalConfirmacao'

import PecaModal from '@/features/pecas/components/PecaModal'
import ServicoModal from '@/features/servicos/components/ServicoModal'

import { veiculoService } from '@/features/veiculos/services/veiculoService'
import { clienteService } from '@/features/clientes/services/clienteService'
import { pecaService } from '@/features/pecas/services/pecaService'
import { servicoService } from '@/features/servicos/services/servicoService'
import { ordemDeServicoService } from '../services/ordemDeServicoService'

import {
  validarEdicaoOrdemDeServico,
  montarPayloadEdicaoOrdemDeServico,
} from '../validations/ordemDeServicoValidation'

import { STATUS_OS, obterStatus } from '@/utils/statusOS'

import {
  calcularSubtotal,
  calcularSubtotalItens,
  formatarMoeda,
} from '../utils/ordemDeServico'

import { formatarPlaca } from '@/utils/formatters'

function nomeItemExistente(item) {
  return item.pecaNome ?? item.servicoNome ?? '—'
}

export default function EditarOrdemDeServicoPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [carregando, setCarregando] = useState(true)
  const [erroCarregamento, setErroCarregamento] = useState(null)

  const [cliente, setCliente] = useState(null)
  const [veiculo, setVeiculo] = useState(null)
  const [pecas, setPecas] = useState([])
  const [servicos, setServicos] = useState([])

  const [statusOriginal, setStatusOriginal] = useState(0)
  const [status, setStatus] = useState(0)
  const [descricaoProblema, setDescricaoProblema] = useState('')
  const [observacoes, setObservacoes] = useState('')
  const [desconto, setDesconto] = useState('')

  // itens já persistidos na OS — a API só permite adicionar itens novos numa
  // edição (não alterar os existentes), por isso ficam só de leitura aqui.
  // a remoção de um item existente é uma chamada separada e imediata (não
  // faz parte do payload de "Salvar alterações").
  const [itensExistentes, setItensExistentes] = useState([])
  const [itensNovos, setItensNovos] = useState([])

  const [modalPeca, setModalPeca] = useState(false)
  const [modalServico, setModalServico] = useState(false)

  const [itemParaRemover, setItemParaRemover] = useState(null)
  const [removendoItem, setRemovendoItem] = useState(false)

  const [salvando, setSalvando] = useState(false)
  const [erros, setErros] = useState({})
  const [erroGeral, setErroGeral] = useState(null)

  useEffect(() => {
    carregar()
  }, [id])

  async function carregar() {
    setCarregando(true)
    setErroCarregamento(null)

    try {
      const ordem = await ordemDeServicoService.buscarPorId(id)

      const [dadosVeiculo, dadosPecas, dadosServicos] = await Promise.all([
        veiculoService.buscarPorId(ordem.veiculoId),
        pecaService.listar(),
        servicoService.listar(),
      ])

      const dadosCliente = await clienteService.buscarPorId(dadosVeiculo.clienteId)

      setCliente(dadosCliente)
      setVeiculo(dadosVeiculo)

      setPecas(Array.isArray(dadosPecas) ? dadosPecas.filter((p) => p.ativo) : [])
      setServicos(Array.isArray(dadosServicos) ? dadosServicos.filter((s) => s.ativo) : [])

      setStatusOriginal(ordem.status)
      setStatus(ordem.status)
      setDescricaoProblema(ordem.descricaoProblema ?? '')
      setObservacoes(ordem.observacoes ?? '')
      setDesconto(String(ordem.desconto ?? ''))
      setItensExistentes(ordem.itens ?? [])
      setItensNovos([])
    } catch {
      setErroCarregamento('Não foi possível carregar a ordem de serviço.')
    } finally {
      setCarregando(false)
    }
  }

  function adicionarItem() {
    setItensNovos((anterior) => [
      ...anterior,
      {
        tipo: 'peca',
        pecaId: '',
        servicoId: '',
        quantidade: 1,
        valorAplicado: 0,
        _key: Date.now() + Math.random(),
      },
    ])
  }

  function removerItemNovo(index) {
    setItensNovos((anterior) => anterior.filter((_, i) => i !== index))
  }

  function pedirConfirmacaoRemocao(item) {
    setItemParaRemover(item)
  }

  async function confirmarRemocaoItem() {
    setRemovendoItem(true)

    try {
      await ordemDeServicoService.removerItem(id, itemParaRemover.id)

      setItensExistentes((anterior) =>
        anterior.filter((item) => item.id !== itemParaRemover.id)
      )

      setItemParaRemover(null)
    } catch (erro) {
      setErroGeral(
        erro?.response?.data?.mensagem ??
        erro?.response?.data?.message ??
        'Erro ao remover o item.'
      )
      setItemParaRemover(null)
    } finally {
      setRemovendoItem(false)
    }
  }

  function alterarItem(index, campo, valor) {
    setItensNovos((anterior) =>
      anterior.map((item, i) => {
        if (i !== index) return item

        const atualizado = { ...item, [campo]: valor }

        if (campo === 'tipo') {
          atualizado.pecaId = ''
          atualizado.servicoId = ''
          atualizado.valorAplicado = 0
        }

        if (campo === 'pecaId' && valor) {
          const peca = pecas.find((p) => String(p.id) === String(valor))
          if (peca) atualizado.valorAplicado = peca.valor
        }

        if (campo === 'servicoId' && valor) {
          const servico = servicos.find((s) => String(s.id) === String(valor))
          if (servico) atualizado.valorAplicado = servico.valor
        }

        return atualizado
      })
    )
  }

  async function salvar() {
    const subtotalExistentes = itensExistentes.reduce((acc, item) => acc + item.subtotal, 0)
    const subtotal = subtotalExistentes + calcularSubtotalItens(itensNovos)

    const errosValidacao = validarEdicaoOrdemDeServico({
      descricaoProblema,
      itensExistentes,
      itensNovos,
      desconto,
      subtotal,
    })

    if (Object.keys(errosValidacao).length > 0) {
      setErros(errosValidacao)
      return
    }

    setSalvando(true)
    setErroGeral(null)

    const payload = montarPayloadEdicaoOrdemDeServico({
      descricaoProblema,
      observacoes,
      desconto,
      itensNovos,
    })

    try {
      await ordemDeServicoService.atualizar(id, payload)

      if (Number(status) !== Number(statusOriginal)) {
        await ordemDeServicoService.alterarStatus(id, Number(status))
      }

      navigate('/ordens')
    } catch (erro) {
      setErroGeral(
        erro?.response?.data?.mensagem ??
        erro?.response?.data?.message ??
        'Erro ao salvar a ordem de serviço.'
      )
    } finally {
      setSalvando(false)
    }
  }

  const subtotalExistentes = itensExistentes.reduce((acc, item) => acc + item.subtotal, 0)
  const subtotal = subtotalExistentes + calcularSubtotalItens(itensNovos)
  const descontoNumerico = Number(desconto || 0)
  const total = Math.max(subtotal - descontoNumerico, 0)
  const statusAtual = obterStatus(status)

  if (carregando) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-(--nos-bg) font-mono text-xs uppercase tracking-widest text-(--nos-text-faint)">
        <span className="animate-pulse text-(--nos-red)">■</span>
        <span className="ml-2">Carregando...</span>
      </div>
    )
  }

  if (erroCarregamento) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-(--nos-bg) font-mono text-(--nos-text)">
        <p className="text-xs text-(--nos-red)">{erroCarregamento}</p>
        <Button variant="ghost" onClick={() => navigate('/ordens')}>
          Voltar para Ordens de Serviço
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-(--nos-bg) font-mono text-(--nos-text)">

      <div className="flex items-center justify-between border-b border-(--nos-border) px-8 py-5">

        <div>
          <p className="text-[10px] uppercase tracking-[0.25em] text-(--nos-red)">
            N-OS / ORDENS DE SERVIÇO / #{String(id).padStart(4, '0')}
          </p>

          <h1 className="text-sm uppercase tracking-widest text-(--nos-text)">
            // EDITAR ORDEM DE SERVIÇO
          </h1>
        </div>

        <div className="flex items-center gap-3">

          <Button
            variant="ghost"
            onClick={() => navigate('/ordens')}
            disabled={salvando}
          >
            Cancelar
          </Button>

          <Button
            variant="primary"
            onClick={salvar}
            loading={salvando}
          >
            Salvar alterações
          </Button>

        </div>
      </div>

      <div className="mx-auto max-w-7xl px-8 py-8">

        {erroGeral && (
          <div className="mb-6 border border-(--nos-red-border) bg-(--nos-red-dim) px-4 py-3">
            <p className="text-xs text-(--nos-red)">{erroGeral}</p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

          <div className="space-y-6">

            <section>

              <p className="mb-4 text-[10px] uppercase tracking-[0.25em] text-(--nos-red)">
                // 01 — IDENTIFICAÇÃO
              </p>

              <div className="space-y-5 border border-(--nos-border) bg-(--nos-surface) p-5">

                <div className="grid grid-cols-2 gap-4">

                  <div>
                    <p className="text-[10px] uppercase tracking-[0.15em] text-(--nos-text-muted)">
                      // CLIENTE
                    </p>
                    <p className="mt-1 text-xs text-(--nos-text)">
                      {cliente?.nome || '—'}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] uppercase tracking-[0.15em] text-(--nos-text-muted)">
                      // VEÍCULO
                    </p>
                    <p className="mt-1 text-xs text-(--nos-text)">
                      {veiculo ? `${formatarPlaca(veiculo.placa)} — ${veiculo.marca} ${veiculo.modelo}` : '—'}
                    </p>
                  </div>

                </div>

                <p className="text-[10px] text-(--nos-text-faint)">
                  Cliente e veículo não podem ser alterados após a abertura da OS.
                </p>

                <div>

                  <label className="mb-2 block text-[10px] uppercase tracking-[0.15em] text-(--nos-text-muted)">
                    // STATUS
                  </label>

                  <div
                    className={[
                      'flex items-center gap-3',
                      'border bg-(--nos-bg)',
                      'px-3 py-2',
                      statusAtual.border,
                    ].join(' ')}
                  >

                    <span
                      className={[
                        'h-2 w-2 shrink-0 rounded-full',
                        statusAtual.dot,
                      ].join(' ')}
                    />

                    <select
                      value={status}
                      onChange={(e) => setStatus(Number(e.target.value))}
                      className={[
                        'w-full bg-transparent',
                        'font-mono text-xs',
                        'focus:outline-none',
                        statusAtual.color,
                      ].join(' ')}
                    >

                      {STATUS_OS.map((statusItem) => (
                        <option
                          key={statusItem.value}
                          value={statusItem.value}
                          className="bg-(--nos-surface) text-(--nos-text)"
                        >
                          {statusItem.label}
                        </option>
                      ))}

                    </select>

                  </div>

                </div>

              </div>

            </section>

            <section>

              <p className="mb-4 text-[10px] uppercase tracking-[0.25em] text-(--nos-red)">
                // 02 — PROBLEMA
              </p>

              <div className="space-y-5 border border-(--nos-border) bg-(--nos-surface) p-5">

                <div>

                  <label className="mb-1 block text-[10px] uppercase tracking-[0.15em] text-(--nos-text-muted)">
                    // DESCRIÇÃO DO PROBLEMA{' '}
                    <span className="text-(--nos-red)">*</span>
                  </label>

                  <textarea
                    rows={4}
                    value={descricaoProblema}
                    onChange={(e) => setDescricaoProblema(e.target.value)}
                    placeholder="Descreva o problema relatado pelo cliente..."
                    className="w-full resize-none border border-(--nos-border-2) bg-(--nos-bg) px-3 py-2 font-mono text-xs text-(--nos-text) placeholder-(--nos-text-faint) focus:border-(--nos-red) focus:outline-none"
                  />

                  {erros.descricaoProblema && (
                    <p className="mt-1 text-[11px] text-(--nos-red)">
                      {erros.descricaoProblema}
                    </p>
                  )}

                </div>

                <div>

                  <label className="mb-1 block text-[10px] uppercase tracking-[0.15em] text-(--nos-text-muted)">
                    // OBSERVAÇÕES
                  </label>

                  <textarea
                    rows={3}
                    value={observacoes}
                    onChange={(e) => setObservacoes(e.target.value)}
                    placeholder="Observações internas (opcional)..."
                    className="w-full resize-none border border-(--nos-border-2) bg-(--nos-bg) px-3 py-2 font-mono text-xs text-(--nos-text) placeholder-(--nos-text-faint) focus:border-(--nos-red) focus:outline-none"
                  />

                </div>

              </div>

            </section>

          </div>

          <div>

            <section>

              <div className="mb-4 flex items-center justify-between">

                <p className="text-[10px] uppercase tracking-[0.25em] text-(--nos-red)">
                  // 03 — PEÇAS E SERVIÇOS
                </p>

                <div className="flex items-center gap-4">

                  <button
                    type="button"
                    onClick={() => setModalPeca(true)}
                    className="text-[10px] uppercase tracking-widest text-(--nos-text-muted) transition-colors hover:text-(--nos-text)"
                  >
                    + Nova peça
                  </button>

                  <button
                    type="button"
                    onClick={() => setModalServico(true)}
                    className="text-[10px] uppercase tracking-widest text-(--nos-text-muted) transition-colors hover:text-(--nos-text)"
                  >
                    + Novo serviço
                  </button>

                  <button
                    type="button"
                    onClick={adicionarItem}
                    className="text-[10px] uppercase tracking-widest text-(--nos-red) transition-colors hover:text-(--nos-red)/70"
                  >
                    + Adicionar item
                  </button>

                </div>

              </div>

              <div className="border border-(--nos-border) bg-(--nos-surface)">

                {itensExistentes.length > 0 && (
                  <>
                    <div className="border-b border-(--nos-border) bg-(--nos-surface) px-4 py-2">
                      <span className="text-[9px] uppercase tracking-widest text-(--nos-text-faint)">
                        Já registrados nesta OS
                      </span>
                    </div>

                    {itensExistentes.map((item) => (
                      <div
                        key={item.id}
                        className="grid grid-cols-[minmax(0,1fr)_55px_65px_24px] items-center gap-3 border-b border-(--nos-border) px-4 py-3"
                      >
                        <span className="truncate text-xs text-(--nos-text)">
                          {nomeItemExistente(item)}
                        </span>

                        <span className="text-center text-[10px] text-(--nos-text-muted)">
                          × {item.quantidade}
                        </span>

                        <span className="text-right text-[10px] text-(--nos-text)">
                          {formatarMoeda(item.subtotal)}
                        </span>

                        <button
                          type="button"
                          onClick={() => pedirConfirmacaoRemocao(item)}
                          className="flex h-[20px] items-center justify-center text-[11px] text-(--nos-text-muted) transition-colors hover:text-(--nos-red)"
                          title="Remover item"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </>
                )}

                {itensNovos.length > 0 && (
                  <div className="border-b border-(--nos-border) bg-(--nos-surface) px-4 py-2">
                    <span className="text-[9px] uppercase tracking-widest text-(--nos-text-faint)">
                      Novos itens
                    </span>
                  </div>
                )}

                {itensExistentes.length === 0 && itensNovos.length === 0 && (
                  <div className="py-12 text-center">
                    <p className="text-xs uppercase tracking-widest text-(--nos-text-faint) ">
                      Nenhum item adicionado
                    </p>

                    <button
                      type="button"
                      onClick={adicionarItem}
                      className="mt-4 text-[10px] uppercase tracking-widest text-(--nos-red)"
                    >
                      + Adicionar primeiro item
                    </button>
                  </div>
                )}

                {itensNovos.length > 0 && (
                  <div className="max-h-[430px] overflow-y-auto">

                    {itensNovos.map((item, index) => {
                      const erroItem = erros[`item_${index}_item`]
                      const erroQtd = erros[`item_${index}_qtd`]

                      return (
                        <div
                          key={item._key ?? index}
                          className="grid grid-cols-[70px_minmax(0,1fr)_55px_65px_24px] items-start gap-3 border-b border-(--nos-border) px-4 py-3 last:border-b-0"
                        >

                          <select
                            value={item.tipo}
                            onChange={(e) => alterarItem(index, 'tipo', e.target.value)}
                            className="h-[34px] w-full border border-(--nos-border-2) bg-(--nos-bg) px-2 font-mono text-[10px] text-(--nos-text) focus:border-(--nos-red) focus:outline-none"
                          >
                            <option value="peca">Peça</option>
                            <option value="servico">Serviço</option>
                          </select>

                          <div className="min-w-0">

                            {item.tipo === 'peca' ? (
                              <select
                                value={item.pecaId}
                                onChange={(e) => alterarItem(index, 'pecaId', e.target.value)}
                                className="h-[34px] w-full border border-(--nos-border-2) bg-(--nos-bg) px-2 font-mono text-[10px] text-(--nos-text) focus:border-(--nos-red) focus:outline-none"
                              >
                                <option value="">Selecione uma peça...</option>
                                {pecas.map((peca) => (
                                  <option key={peca.id} value={peca.id}>{peca.nome}</option>
                                ))}
                              </select>
                            ) : (
                              <select
                                value={item.servicoId}
                                onChange={(e) => alterarItem(index, 'servicoId', e.target.value)}
                                className="h-[34px] w-full border border-(--nos-border-2) bg-(--nos-bg) px-2 font-mono text-[10px] text-(--nos-text) focus:border-(--nos-red) focus:outline-none"
                              >
                                <option value="">Selecione um serviço...</option>
                                {servicos.map((servico) => (
                                  <option key={servico.id} value={servico.id}>{servico.nome}</option>
                                ))}
                              </select>
                            )}

                            <div className="mt-1 flex items-center justify-between">
                              <span className="text-[9px] text-(--nos-text-dim)">
                                {item.valorAplicado > 0 ? formatarMoeda(item.valorAplicado) : ''}
                              </span>
                            </div>

                            {erroItem && (
                              <p className="mt-1 text-[9px] text-(--nos-red)">{erroItem}</p>
                            )}

                          </div>

                          <div>
                            <input
                              type="number"
                              min="1"
                              value={item.quantidade}
                              onChange={(e) => alterarItem(index, 'quantidade', e.target.value)}
                              className="h-[34px] w-full border border-(--nos-border-2) bg-(--nos-bg) px-1 text-center font-mono text-[10px] text-(--nos-text) focus:border-(--nos-red) focus:outline-none"
                            />

                            {erroQtd && (
                              <p className="mt-1 text-[9px] text-(--nos-red)">{erroQtd}</p>
                            )}
                          </div>

                          <div className="flex h-[34px] items-center justify-end">
                            <span className="whitespace-nowrap text-[10px] text-(--nos-text)">
                              {formatarMoeda(calcularSubtotal(item))}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => removerItemNovo(index)}
                            className="flex h-[34px] items-center justify-center text-[11px] text-(--nos-text-muted) transition-colors hover:text-(--nos-red)"
                            title="Remover item"
                          >
                            ×
                          </button>

                        </div>
                      )
                    })}

                  </div>
                )}

                {erros.itens && (
                  <p className="px-4 pb-3 text-[11px] text-(--nos-red)">{erros.itens}</p>
                )}

              </div>

            </section>

            <section className="mt-6">

              <p className="mb-4 text-[10px] uppercase tracking-[0.25em] text-(--nos-red)">
                // 04 — RESUMO
              </p>

              <div className="border border-(--nos-border) bg-(--nos-surface) p-5">

                <div className="space-y-4">

                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-widest text-(--nos-text-muted)">Subtotal</span>
                    <span className="text-xs text-(--nos-text)">{formatarMoeda(subtotal)}</span>
                  </div>

                  <div>
                    <label className="mb-1 block text-[9px] uppercase tracking-widest text-(--nos-text-muted)">
                      // DESCONTO
                    </label>

                    <div className="flex items-center border border-(--nos-border-2) bg-(--nos-bg)">
                      <span className="px-3 text-xs text-(--nos-text-muted)">R$</span>

                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={desconto}
                        onChange={(e) => setDesconto(e.target.value)}
                        placeholder="0,00"
                        className="w-full bg-transparent px-2 py-2 font-mono text-xs text-(--nos-text) placeholder-(--nos-text-faint) focus:outline-none"
                      />
                    </div>

                    {erros.desconto && (
                      <p className="mt-1 text-[10px] text-(--nos-red)">{erros.desconto}</p>
                    )}
                  </div>

                  <div className="border-t border-(--nos-border-2) pt-4">
                    <div className="flex items-end justify-between">
                      <span className="text-[10px] uppercase tracking-widest text-(--nos-text-muted)">// TOTAL</span>
                      <span className="text-xl text-(--nos-text)">{formatarMoeda(total)}</span>
                    </div>
                  </div>

                </div>

              </div>

            </section>

          </div>

        </div>

        <div className="mt-8 flex justify-end gap-3 border-t border-(--nos-border) pt-6">
          <Button variant="ghost" onClick={() => navigate('/ordens')} disabled={salvando}>
            Cancelar
          </Button>

          <Button variant="primary" onClick={salvar} loading={salvando}>
            Salvar alterações
          </Button>
        </div>

      </div>

      <PecaModal
        aberto={modalPeca}
        onFechar={() => setModalPeca(false)}
        onSucesso={async () => {
          const dados = await pecaService.listar()
          setPecas(Array.isArray(dados) ? dados.filter((p) => p.ativo) : [])
          setModalPeca(false)
        }}
      />

      <ServicoModal
        aberto={modalServico}
        onFechar={() => setModalServico(false)}
        onSucesso={async () => {
          const dados = await servicoService.listar()
          setServicos(Array.isArray(dados) ? dados.filter((s) => s.ativo) : [])
          setModalServico(false)
        }}
      />

      <ModalConfirmacao
        aberto={Boolean(itemParaRemover)}
        mensagem={
          itemParaRemover
            ? `Remover "${nomeItemExistente(itemParaRemover)}" desta OS?`
            : ''
        }
        carregando={removendoItem}
        onConfirmar={confirmarRemocaoItem}
        onCancelar={() => setItemParaRemover(null)}
        textoBotao="Remover"
        varianteBotao="danger"
      />

    </div>
  )
}
