import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import Button from '@/components/ui/Button'
import SelectBuscavel from '@/components/ui/SelectBuscavel'

import ClienteModal from '@/features/clientes/components/ClienteModal'
import VeiculoModal from '@/features/veiculos/components/VeiculoModal'
import PecaModal from '@/features/pecas/components/PecaModal'
import ServicoModal from '@/features/servicos/components/ServicoModal'

import { clienteService } from '@/features/clientes/services/clienteService'
import { veiculoService } from '@/features/veiculos/services/veiculoService'
import { pecaService } from '@/features/pecas/services/pecaService'
import { servicoService } from '@/features/servicos/services/servicoService'
import { ordemDeServicoService } from '../services/ordemDeServicoService'

import {
  validarOrdemDeServico,
  montarPayloadOrdemDeServico,
} from '../validations/ordemDeServicoValidation'

import { STATUS_OS, obterStatus } from '@/utils/statusOS'
import { obterMensagemErro } from '@/utils/erros'

import {
  ITEM_VAZIO,
  calcularSubtotal,
  calcularSubtotalItens,
  formatarMoeda,
} from '../utils/ordemDeServico'

export default function NovaOrdemDeServicoPage() {
  const location = useLocation()
  const navigate = useNavigate()

  // o contexto do fluxo guiado vive só no state de navegação (em memória).
  // Um F5 descarta esse state de propósito: o usuário recomeça do zero,
  // com cliente e veículo vazios.
  const wizardState = location.state ?? {}

  // quando o usuário chega aqui pelo fluxo guiado (cadastro de cliente ->
  // veículo -> OS), cliente e veículo já vêm definidos e NÃO podem ser
  // trocados nem cadastrados de novo por modal nesta tela.
  const origemWizard = Boolean(
    wizardState.cliente?.id && wizardState.veiculo?.id
  )

  const [clientes, setClientes] = useState([])
  const [veiculos, setVeiculos] = useState([])
  const [pecas, setPecas] = useState([])
  const [servicos, setServicos] = useState([])
  const [veiculosCarregando, setVeiculosCarregando] = useState(false)
  const [erroCarregamento, setErroCarregamento] = useState(null)
  const [clienteId, setClienteId] = useState(
    wizardState.cliente?.id ?? ''
  )

  const [veiculoId, setVeiculoId] = useState(
    wizardState.veiculo?.id ?? ''
  )

  const [status, setStatus] = useState(0)

  const [descricaoProblema, setDescricaoProblema] =
    useState('')

  const [observacoes, setObservacoes] =
    useState('')

  const [itens, setItens] = useState([])

  const [desconto, setDesconto] =
    useState('')

  const [modalCliente, setModalCliente] =
    useState(false)

  const [modalVeiculo, setModalVeiculo] =
    useState(false)

  const [modalPeca, setModalPeca] =
    useState(false)

  const [modalServico, setModalServico] =
    useState(false)

  const [salvando, setSalvando] =
    useState(false)

  const [erros, setErros] =
    useState({})

  const [erroGeral, setErroGeral] =
    useState(null)

  useEffect(() => {
    carregarClientes()
    carregarPecas()
    carregarServicos()
  }, [])


  useEffect(() => {
    carregarVeiculos(clienteId)
  }, [clienteId])


  async function carregarBase() {
    setErroCarregamento(null)

    await Promise.all([
      carregarClientes(),
      carregarPecas(),
      carregarServicos(),
    ])
  }

  async function tentarCarregarNovamente() {
    await carregarBase()

    if (clienteId) {
      await carregarVeiculos(clienteId)
    }
  }


  async function carregarClientes() {
    try {
      const dados =
        await clienteService.listar()

      setClientes(
        Array.isArray(dados)
          ? dados.filter(
              (cliente) => cliente.ativo
            )
          : []
      )
    } catch (erro) {
      setErroCarregamento(
        obterMensagemErro(
          erro?.response?.data,
          'Falha ao carregar a lista de clientes.'
        )
      )
    }
  }


  async function carregarVeiculos(id) {
    if (!id) {
      setVeiculos([])
      return
    }

    setVeiculosCarregando(true)

    try {
      const dados =
        await veiculoService.listarPorCliente(id)

      setVeiculos(
        Array.isArray(dados)
          ? dados.filter(
              (veiculo) => veiculo.ativo
            )
          : []
      )
    } catch (erro) {
      setVeiculos([])
      setErroCarregamento(
        obterMensagemErro(
          erro?.response?.data,
          'Falha ao carregar os veículos do cliente.'
        )
      )
    } finally {
      setVeiculosCarregando(false)
    }
  }


  async function carregarPecas() {
    try {
      const dados =
        await pecaService.listar()

      setPecas(
        Array.isArray(dados)
          ? dados.filter(
              (peca) => peca.ativo
            )
          : []
      )
    } catch (erro) {
      setErroCarregamento(
        obterMensagemErro(
          erro?.response?.data,
          'Falha ao carregar a lista de peças.'
        )
      )
    }
  }


  async function carregarServicos() {
    try {
      const dados =
        await servicoService.listar()

      setServicos(
        Array.isArray(dados)
          ? dados.filter(
              (servico) => servico.ativo
            )
          : []
      )
    } catch (erro) {
      setErroCarregamento(
        obterMensagemErro(
          erro?.response?.data,
          'Falha ao carregar a lista de serviços.'
        )
      )
    }
  }


  function adicionarItem() {
    setItens((anterior) => [
      ...anterior,
      {
        ...ITEM_VAZIO,
        _key: Date.now() + Math.random(),
      },
    ])
  }


  function removerItem(index) {
    setItens((anterior) =>
      anterior.filter((_, i) => i !== index)
    )
  }


  function alterarItem(index, campo, valor) {
    setItens((anterior) =>
      anterior.map((item, i) => {
        if (i !== index)
          return item

        const atualizado = {
          ...item,
          [campo]: valor,
        }

        if (campo === 'tipo') {
          atualizado.pecaId = ''
          atualizado.servicoId = ''
          atualizado.valorAplicado = 0
        }

        if (campo === 'pecaId' && valor) {
          const peca = pecas.find(
            (p) =>
              String(p.id) === String(valor)
          )

          if (peca) {
            atualizado.valorAplicado =
              peca.valor
          }
        }

        if (campo === 'servicoId' && valor) {
          const servico = servicos.find(
            (s) =>
              String(s.id) === String(valor)
          )

          if (servico) {
            atualizado.valorAplicado =
              servico.valor
          }
        }

        return atualizado
      })
    )
  }

  async function salvar() {
    if (veiculosCarregando) {
      setErroGeral(
        'Aguarde o carregamento dos veículos do cliente.'
      )
      return
    }

    const subtotal = calcularSubtotalItens(itens)

    const errosValidacao = validarOrdemDeServico({
      clienteId,
      veiculoId,
      descricaoProblema,
      itens,
      desconto,
      subtotal,
      veiculosDoCliente: veiculos,
    })

    if (Object.keys(errosValidacao).length > 0) {
      setErros(errosValidacao)
      return
    }

    setSalvando(true)
    setErroGeral(null)

    // o backend só recebe o VeiculoId e deriva o cliente de Veiculo.Cliente,
    // então nunca acusa "veículo de outro cliente" — a OS sempre nasce
    // coerente com o dono real do veículo. Essa checagem client-side é a
    // única defesa contra abrir a OS para um cliente diferente do que está
    // na tela (ex.: veiculoId defasado após trocar de cliente).
    try {
      const veiculoSelecionado =
        await veiculoService.buscarPorId(veiculoId)

      if (
        String(veiculoSelecionado?.clienteId) !==
        String(clienteId)
      ) {
        setErros({
          veiculoId:
            'O veículo selecionado não pertence a este cliente',
        })
        setSalvando(false)
        return
      }
    } catch {
      // não foi possível revalidar agora — segue e deixa o backend
      // aceitar/recusar pelas regras dele (veículo existe/ativo, etc.)
    }

    const payload = montarPayloadOrdemDeServico({
      veiculoId,
      status,
      descricaoProblema,
      observacoes,
      desconto,
      itens,
    })

    try {
      await ordemDeServicoService.criar(
        payload
      )

      navigate('/ordens')
    } catch (erro) {
      setErroGeral(
        obterMensagemErro(
          erro?.response?.data,
          'Erro ao abrir ordem de serviço.'
        )
      )
    } finally {
      setSalvando(false)
    }
  }

  const subtotal =
    calcularSubtotalItens(itens)

  const descontoNumerico =
    Number(desconto || 0)

  const total = Math.max(
    subtotal - descontoNumerico,
    0
  )

  const statusAtual =
    obterStatus(status)


  return (
    <div className="min-h-screen bg-(--nos-bg) font-mono text-(--nos-text)">

      <div className="flex items-center justify-between border-b border-(--nos-border) px-8 py-5">

        <div>
          <p className="text-[10px] uppercase tracking-[0.25em] text-(--nos-red)">
            N-OS / ORDENS DE SERVIÇO / NOVA
          </p>

          <h1 className="text-sm uppercase tracking-widest text-(--nos-text)">
            // NOVA ORDEM DE SERVIÇO
          </h1>
        </div>

        <div className="flex items-center gap-3">

          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            disabled={salvando}
          >
            Cancelar
          </Button>

          <Button
            variant="primary"
            onClick={salvar}
            loading={salvando}
          >
            Abrir OS
          </Button>

        </div>
      </div>


      <div className="mx-auto max-w-7xl px-8 py-8">

        {erroGeral && (
          <div className="mb-6 border border-(--nos-red-border) bg-(--nos-red-dim) px-4 py-3">
            <p className="text-xs text-(--nos-red)">
              {erroGeral}
            </p>
          </div>
        )}

        {erroCarregamento && (
          <div className="mb-6 flex items-center justify-between gap-4 border border-(--nos-red-border) bg-(--nos-red-dim) px-4 py-3">
            <p className="text-xs text-(--nos-red)">
              {erroCarregamento}
            </p>

            <Button
              variant="ghost"
              size="sm"
              onClick={tentarCarregarNovamente}
            >
              Tentar novamente
            </Button>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

          <div className="space-y-6">

            <section>

              <p className="mb-4 text-[10px] uppercase tracking-[0.25em] text-(--nos-red)">
                // 01 — IDENTIFICAÇÃO
              </p>

              <div className="space-y-5 border border-(--nos-border) bg-(--nos-surface) p-5">

                {origemWizard ? (

                  <>

                    <div className="grid grid-cols-2 gap-4">

                      <div>
                        <p className="text-[10px] uppercase tracking-[0.15em] text-(--nos-text-muted)">
                          // CLIENTE
                        </p>
                        <p className="mt-1 text-xs text-(--nos-text)">
                          {wizardState.cliente.nome}
                        </p>
                        <p className="text-[10px] text-(--nos-text-muted)">
                          #{String(wizardState.cliente.id).padStart(4, '0')}
                        </p>
                      </div>

                      <div>
                        <p className="text-[10px] uppercase tracking-[0.15em] text-(--nos-text-muted)">
                          // VEÍCULO
                        </p>
                        <p className="mt-1 text-xs text-(--nos-text)">
                          {wizardState.veiculo.placa}
                          {' — '}
                          {wizardState.veiculo.marca}
                          {' '}
                          {wizardState.veiculo.modelo}
                        </p>
                        <p className="text-[10px] text-(--nos-text-muted)">
                          {wizardState.veiculo.ano}
                        </p>
                      </div>

                    </div>

                    <p className="text-[10px] text-(--nos-text-faint)">
                      Cliente e veículo definidos no cadastro guiado e não
                      podem ser alterados nesta OS.
                    </p>

                  </>

                ) : (

                  <>

                <div>

                  <div className="mb-1 flex items-center justify-between">

                    <label className="text-[10px] uppercase tracking-[0.15em] text-(--nos-text-muted)">
                      // CLIENTE{' '}
                      <span className="text-(--nos-red)">
                        *
                      </span>
                    </label>

                    <button
                      type="button"
                      onClick={() =>
                        setModalCliente(true)
                      }
                      className="text-[10px] uppercase tracking-widest text-(--nos-red) transition-colors hover:text-(--nos-red)/70"
                    >
                      + Novo cliente
                    </button>

                  </div>

                  <SelectBuscavel
                    id="cliente"
                    value={clienteId}
                    onChange={(valor) => {
                      setClienteId(valor)
                      setVeiculoId('')
                    }}
                    options={clientes.map((cliente) => ({
                      value: cliente.id,
                      label: `#${String(cliente.id).padStart(4, '0')} — ${cliente.nome}`,
                    }))}
                    placeholder="Buscar cliente..."
                    semResultadoTexto="Nenhum cliente encontrado"
                    className="w-full border border-(--nos-border-2) bg-(--nos-bg) px-3 py-2 font-mono text-xs text-(--nos-text)"
                  />

                  {erros.clienteId && (
                    <p className="mt-1 text-[11px] text-(--nos-red)">
                      {erros.clienteId}
                    </p>
                  )}

                </div>

                <div>

                  <div className="mb-1 flex items-center justify-between">

                    <label className="text-[10px] uppercase tracking-[0.15em] text-(--nos-text-muted)">
                      // VEÍCULO{' '}
                      <span className="text-(--nos-red)">
                        *
                      </span>
                    </label>

                    <button
                      type="button"
                      onClick={() =>
                        setModalVeiculo(true)
                      }
                      className="text-[10px] uppercase tracking-widest text-(--nos-red) transition-colors hover:text-(--nos-red)/70"
                    >
                      + Novo veículo
                    </button>

                  </div>

                  <SelectBuscavel
                    value={veiculoId}
                    onChange={setVeiculoId}
                    disabled={!clienteId || veiculosCarregando}
                    options={veiculos.map((veiculo) => ({
                      value: veiculo.id,
                      label: `${veiculo.placa} — ${veiculo.marca} ${veiculo.modelo} (${veiculo.ano})`,
                    }))}
                    placeholder={
                      !clienteId
                        ? 'Selecione um cliente primeiro'
                        : veiculosCarregando
                          ? 'Carregando veículos...'
                          : 'Buscar veículo...'
                    }
                    semResultadoTexto="Nenhum veículo encontrado"
                    className="w-full border border-(--nos-border-2) bg-(--nos-bg) px-3 py-2 font-mono text-xs text-(--nos-text)"
                  />

                  {erros.veiculoId && (
                    <p className="mt-1 text-[11px] text-(--nos-red)">
                      {erros.veiculoId}
                    </p>
                  )}

                </div>

                  </>

                )}

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
                      onChange={(e) =>
                        setStatus(
                          Number(e.target.value)
                        )
                      }
                      className={[
                        'w-full bg-transparent',
                        'font-mono text-xs',
                        'focus:outline-none',
                        statusAtual.color,
                      ].join(' ')}
                    >

                      {STATUS_OS.map(
                        (statusItem) => (
                          <option
                            key={statusItem.value}
                            value={statusItem.value}
                            className="bg-(--nos-surface) text-(--nos-text)"
                          >
                            {statusItem.label}
                          </option>
                        )
                      )}

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
                    <span className="text-(--nos-red)">
                      *
                    </span>
                  </label>

                  <textarea
                    rows={4}
                    value={descricaoProblema}
                    onChange={(e) =>
                      setDescricaoProblema(
                        e.target.value
                      )
                    }
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
                    onChange={(e) =>
                      setObservacoes(
                        e.target.value
                      )
                    }
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
                    onClick={() =>
                      setModalPeca(true)
                    }
                    className="text-[10px] uppercase tracking-widest text-(--nos-text-muted) transition-colors hover:text-(--nos-text)"
                  >
                    + Nova peça
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setModalServico(true)
                    }
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

                {itens.length === 0 ? (

                  <div className="py-12 text-center">

                    <p className="text-xs uppercase tracking-widest text-(--nos-text-faint)">
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

                ) : (

                  <>

                    <div className="grid grid-cols-[70px_minmax(0,1fr)_55px_65px_24px] gap-3 border-b border-(--nos-border) bg-(--nos-surface) px-4 py-3">

                      <span className="text-[9px] uppercase tracking-widest text-(--nos-text-muted)">
                        Tipo
                      </span>

                      <span className="text-[9px] uppercase tracking-widest text-(--nos-text-muted)">
                        Item
                      </span>

                      <span className="text-center text-[9px] uppercase tracking-widest text-(--nos-text-muted)">
                        Qtd.
                      </span>

                      <span className="text-right text-[9px] uppercase tracking-widest text-(--nos-text-muted)">
                        Subtotal
                      </span>

                      <span />

                    </div>

                    <div className="max-h-[430px] overflow-y-auto">

                      {itens.map(
                        (item, index) => {

                          const erroItem =
                            erros[
                              `item_${index}_item`
                            ]

                          const erroQtd =
                            erros[
                              `item_${index}_qtd`
                            ]

                          return (
                            <div
                              key={
                                item._key ??
                                index
                              }
                              className="grid grid-cols-[70px_minmax(0,1fr)_55px_65px_24px] items-start gap-3 border-b border-(--nos-border) px-4 py-3 last:border-b-0"
                            >

                              <select
                                value={item.tipo}
                                onChange={(e) =>
                                  alterarItem(
                                    index,
                                    'tipo',
                                    e.target.value
                                  )
                                }
                                className="h-[34px] w-full border border-(--nos-border-2) bg-(--nos-bg) px-2 font-mono text-[10px] text-(--nos-text) focus:border-(--nos-red) focus:outline-none"
                              >

                                <option value="peca">
                                  Peça
                                </option>

                                <option value="servico">
                                  Serviço
                                </option>

                              </select>

                              <div className="min-w-0">

                                {item.tipo === 'peca' ? (

                                  <SelectBuscavel
                                    value={item.pecaId}
                                    onChange={(valor) =>
                                      alterarItem(
                                        index,
                                        'pecaId',
                                        valor
                                      )
                                    }
                                    options={pecas.map((peca) => ({
                                      value: peca.id,
                                      label: peca.nome,
                                    }))}
                                    placeholder="Buscar peça..."
                                    semResultadoTexto="Nenhuma peça encontrada"
                                    className="h-[34px] w-full border border-(--nos-border-2) bg-(--nos-bg) px-2 font-mono text-[10px] text-(--nos-text)"
                                  />

                                ) : (

                                  <SelectBuscavel
                                    value={item.servicoId}
                                    onChange={(valor) =>
                                      alterarItem(
                                        index,
                                        'servicoId',
                                        valor
                                      )
                                    }
                                    options={servicos.map((servico) => ({
                                      value: servico.id,
                                      label: servico.nome,
                                    }))}
                                    placeholder="Buscar serviço..."
                                    semResultadoTexto="Nenhum serviço encontrado"
                                    className="h-[34px] w-full border border-(--nos-border-2) bg-(--nos-bg) px-2 font-mono text-[10px] text-(--nos-text)"
                                  />

                                )}

                                <div className="mt-1 flex items-center justify-between">

                                  <span className="text-[9px] text-(--nos-text-dim)">
                                    {item.valorAplicado > 0
                                      ? formatarMoeda(
                                          item.valorAplicado
                                        )
                                      : ''}
                                  </span>

                                </div>


                                {erroItem && (
                                  <p className="mt-1 text-[9px] text-(--nos-red)">
                                    {erroItem}
                                  </p>
                                )}

                              </div>

                              <div>

                                <input
                                  type="number"
                                  min="1"
                                  value={
                                    item.quantidade
                                  }
                                  onChange={(e) =>
                                    alterarItem(
                                      index,
                                      'quantidade',
                                      e.target.value
                                    )
                                  }
                                  className="h-[34px] w-full border border-(--nos-border-2) bg-(--nos-bg) px-1 text-center font-mono text-[10px] text-(--nos-text) focus:border-(--nos-red) focus:outline-none"
                                />

                                {erroQtd && (
                                  <p className="mt-1 text-[9px] text-(--nos-red)">
                                    {erroQtd}
                                  </p>
                                )}

                              </div>

                              <div className="flex h-[34px] items-center justify-end">

                                <span className="whitespace-nowrap text-[10px] text-(--nos-text)">
                                  {formatarMoeda(
                                    calcularSubtotal(
                                      item
                                    )
                                  )}
                                </span>

                              </div>

                              <button
                                type="button"
                                onClick={() =>
                                  removerItem(
                                    index
                                  )
                                }
                                className="flex h-[34px] items-center justify-center text-[11px] text-(--nos-text-muted) transition-colors hover:text-(--nos-red)"
                                title="Remover item"
                              >
                                ×
                              </button>

                            </div>
                          )
                        }
                      )}

                    </div>

                  </>
                )}


                {erros.itens && (
                  <p className="px-4 pb-3 text-[11px] text-(--nos-red)">
                    {erros.itens}
                  </p>
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

                    <span className="text-[10px] uppercase tracking-widest text-(--nos-text-muted)">
                      Subtotal
                    </span>

                    <span className="text-xs text-(--nos-text)">
                      {formatarMoeda(
                        subtotal
                      )}
                    </span>

                  </div>

                  <div>

                    <label className="mb-1 block text-[9px] uppercase tracking-widest text-(--nos-text-muted)">
                      // DESCONTO
                    </label>

                    <div className="flex items-center border border-(--nos-border-2) bg-(--nos-bg)">

                      <span className="px-3 text-xs text-(--nos-text-muted)">
                        R$
                      </span>

                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={desconto}
                        onChange={(e) =>
                          setDesconto(
                            e.target.value
                          )
                        }
                        placeholder="0,00"
                        className="w-full bg-transparent px-2 py-2 font-mono text-xs text-(--nos-text) placeholder-(--nos-text-faint) focus:outline-none"
                      />

                    </div>

                    {erros.desconto && (
                      <p className="mt-1 text-[10px] text-(--nos-red)">
                        {erros.desconto}
                      </p>
                    )}

                  </div>

                  <div className="border-t border-(--nos-border-2) pt-4">

                    <div className="flex items-end justify-between">

                      <span className="text-[10px] uppercase tracking-widest text-(--nos-text-muted)">
                        // TOTAL
                      </span>

                      <span className="text-xl text-(--nos-text)">
                        {formatarMoeda(
                          total
                        )}
                      </span>

                    </div>

                  </div>

                </div>

              </div>

            </section>

          </div>

        </div>

        <div className="mt-8 flex justify-end gap-3 border-t border-(--nos-border) pt-6">

          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            disabled={salvando}
          >
            Cancelar
          </Button>

          <Button
            variant="primary"
            onClick={salvar}
            loading={salvando}
          >
            Abrir OS
          </Button>

        </div>

      </div>

      {!origemWizard && (
        <ClienteModal
          aberto={modalCliente}
          onFechar={() =>
            setModalCliente(false)
          }
          onSucesso={async (
            clienteCriado
          ) => {

            await carregarClientes()

            if (clienteCriado?.id) {
              setClienteId(
                clienteCriado.id
              )
              // troca de cliente: o veículo do cliente anterior não
              // pertence ao novo, então precisa ser limpo.
              setVeiculoId('')
            }

            setModalCliente(false)
          }}
        />
      )}


      {!origemWizard && (
        <VeiculoModal
          aberto={modalVeiculo}
          onFechar={() =>
            setModalVeiculo(false)
          }
          onSucesso={async (
            veiculoCriado
          ) => {

            // o veículo pode ter sido cadastrado para um cliente
            // diferente do que está selecionado na OS — alinha os dois
            // para nunca gravar veículo de outro cliente.
            const donoId =
              veiculoCriado?.clienteId ?? clienteId

            if (
              donoId &&
              String(donoId) !== String(clienteId)
            ) {
              await carregarClientes()
              setClienteId(String(donoId))
            }

            if (donoId) {
              await carregarVeiculos(donoId)
            }

            if (veiculoCriado?.id) {
              setVeiculoId(
                veiculoCriado.id
              )
            }

            setModalVeiculo(false)
          }}
        />
      )}


      <PecaModal
        aberto={modalPeca}
        onFechar={() =>
          setModalPeca(false)
        }
        onSucesso={async () => {

          await carregarPecas()

          setModalPeca(false)
        }}
      />


      <ServicoModal
        aberto={modalServico}
        onFechar={() =>
          setModalServico(false)
        }
        onSucesso={async () => {

          await carregarServicos()

          setModalServico(false)
        }}
      />

    </div>
  )
}