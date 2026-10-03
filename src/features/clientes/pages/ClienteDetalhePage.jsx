import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import Tabs from '@/components/ui/Tabs'
import ModalConfirmacao from '@/components/shared/ModalConfirmacao'
import ModalErro from '@/components/shared/ModalErro'

import ClienteCampos from '../components/ClienteCampos'

import { clienteService } from '../services/clienteService'
import { ordemDeServicoService } from '@/features/os/services/ordemDeServicoService'

import { statusOSParaPreset } from '@/utils/statusOS'
import {
  formatarData,
  formatarDocumento,
  formatarMoeda,
  formatarPlaca,
  formatarTelefone,
  obterIniciais,
} from '@/utils/formatters'
import { obterMensagemErro } from '@/utils/erros'
import {
  CLIENTE_FORMULARIO_VAZIO,
  inferirTipoDocumento,
  validarCliente,
  montarPayloadCliente,
} from '../validations/clienteValidation'

const ABAS = [
  { id: 'dados', label: 'Dados' },
  { id: 'veiculos', label: 'Veículos' },
  { id: 'ordens', label: 'Ordens de Serviço' },
]

export default function ClienteDetalhePage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [cliente, setCliente] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const [erroCarregamento, setErroCarregamento] = useState(null)

  const [abaAtiva, setAbaAtiva] = useState('dados')

  // ─── aba dados ────────────────────────────────────────────────────────────
  const [formulario, setFormulario] = useState(CLIENTE_FORMULARIO_VAZIO)
  const [erros, setErros] = useState({})
  const [mensagemErro, setMensagemErro] = useState(null)
  const [mensagemSucesso, setMensagemSucesso] = useState(null)
  const [salvando, setSalvando] = useState(false)

  // ─── aba ordens ───────────────────────────────────────────────────────────
  const [ordens, setOrdens] = useState([])
  const [carregandoOrdens, setCarregandoOrdens] = useState(false)

  // ─── inativar/reativar ────────────────────────────────────────────────────
  const [confirmacaoStatus, setConfirmacaoStatus] = useState(null)
  const [alterandoStatus, setAlterandoStatus] = useState(false)
  const [erroAcao, setErroAcao] = useState(null)

  useEffect(() => {
    carregar()
  }, [id])

  async function carregar() {
    setCarregando(true)
    setErroCarregamento(null)

    try {
      const dados = await clienteService.buscarPorId(id)

      setCliente(dados)

      setFormulario({
        nome: dados.nome ?? '',
        telefone: dados.telefone ?? '',
        email: dados.email ?? '',
        tipoDocumento: inferirTipoDocumento(dados.documento),
        documento: dados.documento ?? '',
        cep: dados.cep ?? '',
        logradouro: dados.logradouro ?? '',
        numero: dados.numero ?? '',
        complemento: dados.complemento ?? '',
        bairro: dados.bairro ?? '',
        cidade: dados.cidade ?? '',
        estado: dados.estado ?? '',
      })
    } catch {
      setErroCarregamento('Não foi possível carregar o cliente.')
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => {
    if (abaAtiva === 'ordens' && cliente) {
      carregarOrdens()
    }
  }, [abaAtiva, cliente])

  async function carregarOrdens() {
    setCarregandoOrdens(true)

    try {
      const veiculoIds = new Set(cliente.veiculos.map((v) => v.id))
      const todas = await ordemDeServicoService.listar()

      setOrdens(
        Array.isArray(todas)
          ? todas.filter((ordem) => veiculoIds.has(ordem.veiculoId))
          : []
      )
    } catch {
      setOrdens([])
    } finally {
      setCarregandoOrdens(false)
    }
  }

  async function salvar(e) {
    e.preventDefault()
    if (!cliente.ativo) return

    const errosValidacao = validarCliente(formulario)

    if (Object.keys(errosValidacao).length > 0) {
      setErros(errosValidacao)
      return
    }

    if (erros.documento) return

    setSalvando(true)
    setMensagemErro(null)
    setMensagemSucesso(null)

    try {
      const atualizado = await clienteService.atualizar(
        id,
        montarPayloadCliente(formulario)
      )

      setCliente((anterior) => ({ ...anterior, ...atualizado }))
      setMensagemSucesso('Dados salvos com sucesso.')
    } catch (erro) {
      setMensagemErro(
        obterMensagemErro(erro?.response?.data, 'Erro ao salvar cliente.')
      )
    } finally {
      setSalvando(false)
    }
  }

  function abrirConfirmacao() {
    setConfirmacaoStatus({
      ativo: cliente.ativo,
      mensagem: cliente.ativo
        ? `Deseja inativar "${cliente.nome}"?`
        : `Deseja reativar "${cliente.nome}"?`,
    })
  }

  async function confirmarAlteracaoStatus() {
    setAlterandoStatus(true)

    try {
      if (cliente.ativo) {
        await clienteService.inativar(id)
      } else {
        await clienteService.reativar(id)
      }

      await carregar()
    } catch (erro) {
      setErroAcao(
        obterMensagemErro(erro?.response?.data, 'Erro ao alterar status do cliente.')
      )
    } finally {
      setAlterandoStatus(false)
      setConfirmacaoStatus(null)
    }
  }

  if (carregando) {
    return (
      <div className="flex min-h-screen items-center justify-center gap-2 bg-(--nos-bg) font-mono text-xs uppercase tracking-widest text-(--nos-text-faint)">
        <span className="animate-pulse text-(--nos-red)">■</span>
        Carregando...
      </div>
    )
  }

  if (erroCarregamento || !cliente) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-(--nos-bg) font-mono text-(--nos-text)">
        <p className="text-xs text-(--nos-red)">{erroCarregamento}</p>
        <Button variant="ghost" onClick={() => navigate('/clientes')}>
          Voltar para Clientes
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-(--nos-bg) p-8 font-mono text-(--nos-text)">

      <div className="mb-2 flex items-center justify-between">
        <p className="text-[10px] uppercase tracking-[0.25em] text-(--nos-red)">
          N-OS / CLIENTES / #{String(cliente.id).padStart(4, '0')}
        </p>

        <Button variant="ghost" onClick={() => navigate('/clientes')}>
          ← Voltar
        </Button>
      </div>

      {/* box fixo — identificação + abas. só o conteúdo abaixo muda por aba */}
      <div className="border border-(--nos-border) bg-(--nos-surface)">

        <div className="flex items-start justify-between px-6 py-5">

          <div className="flex items-center gap-4">

            <div className="flex h-12 w-12 shrink-0 items-center justify-center border border-(--nos-red)/40 bg-(--nos-red)/10 text-sm font-bold text-(--nos-red)">
              {obterIniciais(cliente.nome)}
            </div>

            <div>
              <div className="mb-1 flex items-center gap-3">
                <h1 className="text-sm uppercase tracking-widest text-(--nos-text)">
                  {cliente.nome}
                </h1>
                <Badge status={cliente.ativo ? 'ativo' : 'inativo'} />
              </div>

              <p className="text-xs text-(--nos-text-muted)">
                {formatarDocumento(cliente.documento)}
                {' · '}
                {formatarTelefone(cliente.telefone)}
                {cliente.email ? ` · ${cliente.email}` : ''}
              </p>

              {cliente.cidade && (
                <p className="mt-0.5 text-[10px] text-(--nos-text-faint)">
                  {cliente.cidade}
                  {cliente.estado ? ` / ${cliente.estado}` : ''}
                </p>
              )}
            </div>

          </div>

          <Button
            variant="ghost"
            className={
              cliente.ativo
                ? 'hover:!text-(--nos-red)'
                : 'hover:!text-(--nos-success)'
            }
            onClick={abrirConfirmacao}
          >
            {cliente.ativo ? 'Inativar' : 'Reativar'}
          </Button>

        </div>

        <Tabs abas={ABAS} abaAtiva={abaAtiva} onSelecionar={setAbaAtiva} />

      </div>

      <div className="pt-6">

        {abaAtiva === 'dados' && (
          <form
            onSubmit={salvar}
            className="space-y-5 border border-(--nos-border) bg-(--nos-surface) p-5"
          >
            {!cliente.ativo && (
              <p className="text-[10px] uppercase tracking-widest text-(--nos-text-faint)">
                Cliente inativo — reative para editar.
              </p>
            )}

            <fieldset disabled={!cliente.ativo} className="space-y-5 disabled:opacity-60">
              <ClienteCampos
                formulario={formulario}
                setFormulario={setFormulario}
                erros={erros}
                setErros={setErros}
                idClienteAtual={Number(id)}
              />
            </fieldset>

            {mensagemErro && (
              <div className="border border-(--nos-red-border) bg-(--nos-red-dim) px-4 py-2">
                <p className="text-xs text-(--nos-red)">{mensagemErro}</p>
              </div>
            )}

            {mensagemSucesso && (
              <div className="border border-(--nos-success)/40 bg-(--nos-success)/10 px-4 py-2">
                <p className="text-xs text-(--nos-success)">{mensagemSucesso}</p>
              </div>
            )}

            {cliente.ativo && (
              <div className="flex justify-end">
                <Button variant="primary" type="submit" loading={salvando}>
                  Salvar alterações
                </Button>
              </div>
            )}
          </form>
        )}

        {abaAtiva === 'veiculos' && (
          <div className="border border-(--nos-border) bg-(--nos-surface)">
            {cliente.veiculos.length === 0 ? (
              <div className="py-12 text-center text-xs uppercase tracking-widest text-(--nos-text-faint)">
                Nenhum veículo cadastrado
              </div>
            ) : (
              cliente.veiculos.map((veiculo, indice) => (
                <button
                  key={veiculo.id}
                  type="button"
                  onClick={() => navigate(`/veiculos/${veiculo.id}`)}
                  className={[
                    'flex w-full items-center justify-between px-4 py-3 text-left',
                    'transition-colors hover:bg-(--nos-surface-2)',
                    !veiculo.ativo ? 'opacity-40' : '',
                    indice !== cliente.veiculos.length - 1
                      ? 'border-b border-(--nos-border)'
                      : '',
                  ].join(' ')}
                >
                  <div>
                    <p className="text-xs text-(--nos-text)">
                      {formatarPlaca(veiculo.placa)}
                    </p>
                    <p className="text-[10px] text-(--nos-text-muted)">
                      {veiculo.marca} {veiculo.modelo} ({veiculo.ano})
                    </p>
                  </div>

                  <Badge status={veiculo.ativo ? 'ativo' : 'inativo'} />
                </button>
              ))
            )}
          </div>
        )}

        {abaAtiva === 'ordens' && (
          <div className="border border-(--nos-border) bg-(--nos-surface)">
            {carregandoOrdens && (
              <div className="py-12 text-center text-xs uppercase tracking-widest text-(--nos-text-faint)">
                Carregando...
              </div>
            )}

            {!carregandoOrdens && ordens.length === 0 && (
              <div className="py-12 text-center text-xs uppercase tracking-widest text-(--nos-text-faint)">
                Nenhuma ordem de serviço encontrada
              </div>
            )}

            {!carregandoOrdens &&
              ordens.map((ordem, indice) => {
                const veiculo = cliente.veiculos.find(
                  (v) => v.id === ordem.veiculoId
                )

                return (
                  <button
                    key={ordem.id}
                    type="button"
                    onClick={() => navigate(`/ordens/${ordem.id}/editar`)}
                    className={[
                      'grid w-full grid-cols-[80px_1fr_140px_100px] items-center gap-3 px-4 py-3 text-left',
                      'transition-colors hover:bg-(--nos-surface-2)',
                      indice !== ordens.length - 1
                        ? 'border-b border-(--nos-border)'
                        : '',
                    ].join(' ')}
                  >
                    <span className="text-xs text-(--nos-red)">
                      #{String(ordem.id).padStart(4, '0')}
                    </span>

                    <div className="min-w-0">
                      <p className="truncate text-xs text-(--nos-text)">
                        {veiculo ? formatarPlaca(veiculo.placa) : '—'}
                      </p>
                      <p className="text-[10px] text-(--nos-text-muted)">
                        {formatarData(ordem.dataAbertura)}
                      </p>
                    </div>

                    <Badge status={statusOSParaPreset(ordem.status)} />

                    <span className="text-right text-xs text-(--nos-text)">
                      {formatarMoeda(ordem.valorTotal)}
                    </span>
                  </button>
                )
              })}
          </div>
        )}

      </div>

      <ModalConfirmacao
        aberto={Boolean(confirmacaoStatus)}
        mensagem={confirmacaoStatus?.mensagem}
        carregando={alterandoStatus}
        onConfirmar={confirmarAlteracaoStatus}
        onCancelar={() => setConfirmacaoStatus(null)}
        textoBotao={confirmacaoStatus?.ativo ? 'Inativar' : 'Reativar'}
        varianteBotao={confirmacaoStatus?.ativo ? 'danger' : 'secondary'}
      />

      <ModalErro
        aberto={Boolean(erroAcao)}
        mensagem={erroAcao}
        onFechar={() => setErroAcao(null)}
      />

    </div>
  )
}
