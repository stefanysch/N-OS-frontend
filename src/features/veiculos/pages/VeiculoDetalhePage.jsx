import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import Tabs from '@/components/ui/Tabs'
import ModalConfirmacao from '@/components/shared/ModalConfirmacao'
import ModalErro from '@/components/shared/ModalErro'

import VeiculoCampos from '../components/VeiculoCampos'

import { veiculoService } from '../services/veiculoService'
import { clienteService } from '@/features/clientes/services/clienteService'
import { ordemDeServicoService } from '@/features/os/services/ordemDeServicoService'

import { statusOSParaPreset } from '@/utils/statusOS'
import {
  formatarData,
  formatarDocumento,
  formatarMoeda,
  formatarPlaca,
  formatarTelefone,
  formatarVeiculo,
} from '@/utils/formatters'
import { obterMensagemErro } from '@/utils/erros'
import {
  VEICULO_FORMULARIO_VAZIO,
  validarVeiculo,
  montarPayloadVeiculo,
} from '../validations/veiculoValidation'

const ABAS = [
  { id: 'dados', label: 'Dados' },
  { id: 'ordens', label: 'Ordens de Serviço' },
]

export default function VeiculoDetalhePage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [veiculo, setVeiculo] = useState(null)
  const [cliente, setCliente] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const [erroCarregamento, setErroCarregamento] = useState(null)

  const [abaAtiva, setAbaAtiva] = useState('dados')

  // ─── aba dados ────────────────────────────────────────────────────────────
  const [formulario, setFormulario] = useState(VEICULO_FORMULARIO_VAZIO)
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
      const dadosVeiculo = await veiculoService.buscarPorId(id)
      const dadosCliente = await clienteService.buscarPorId(dadosVeiculo.clienteId)

      setVeiculo(dadosVeiculo)
      setCliente(dadosCliente)

      setFormulario({
        placa: dadosVeiculo.placa ?? '',
        marca: dadosVeiculo.marca ?? '',
        modelo: dadosVeiculo.modelo ?? '',
        ano: String(dadosVeiculo.ano ?? ''),
        cor: dadosVeiculo.cor ?? '',
        chassi: dadosVeiculo.chassi ?? '',
      })
    } catch {
      setErroCarregamento('Não foi possível carregar o veículo.')
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => {
    if (abaAtiva === 'ordens' && veiculo) {
      carregarOrdens()
    }
  }, [abaAtiva, veiculo])

  async function carregarOrdens() {
    setCarregandoOrdens(true)

    try {
      const todas = await ordemDeServicoService.listar()

      setOrdens(
        Array.isArray(todas)
          ? todas.filter((ordem) => ordem.veiculoId === veiculo.id)
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
    if (!veiculo.ativo) return

    const errosValidacao = validarVeiculo(formulario, { exigirCliente: false })

    if (Object.keys(errosValidacao).length > 0) {
      setErros(errosValidacao)
      return
    }

    setSalvando(true)
    setMensagemErro(null)
    setMensagemSucesso(null)

    try {
      const atualizado = await veiculoService.atualizar(
        id,
        montarPayloadVeiculo(formulario)
      )

      setVeiculo(atualizado)
      setMensagemSucesso('Dados salvos com sucesso.')
    } catch (erro) {
      setMensagemErro(
        obterMensagemErro(erro?.response?.data, 'Erro ao salvar veículo.')
      )
    } finally {
      setSalvando(false)
    }
  }

  function abrirConfirmacao() {
    setConfirmacaoStatus({
      ativo: veiculo.ativo,
      mensagem: veiculo.ativo
        ? `Deseja inativar "${veiculo.modelo} ${veiculo.placa}"?`
        : `Deseja reativar "${veiculo.modelo} ${veiculo.placa}"?`,
    })
  }

  async function confirmarAlteracaoStatus() {
    setAlterandoStatus(true)

    try {
      if (veiculo.ativo) {
        await veiculoService.inativar(id)
      } else {
        await veiculoService.reativar(id)
      }

      await carregar()
    } catch (erro) {
      setErroAcao(
        obterMensagemErro(erro?.response?.data, 'Erro ao alterar status do veículo.')
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

  if (erroCarregamento || !veiculo) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-(--nos-bg) font-mono text-(--nos-text)">
        <p className="text-xs text-(--nos-red)">{erroCarregamento}</p>
        <Button variant="ghost" onClick={() => navigate('/veiculos')}>
          Voltar para Veículos
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-(--nos-bg) p-8 font-mono text-(--nos-text)">

      <div className="mb-2 flex items-center justify-between">
        <p className="text-[10px] uppercase tracking-[0.25em] text-(--nos-red)">
          N-OS / VEÍCULOS / #{String(veiculo.id).padStart(4, '0')}
        </p>

        <Button variant="ghost" onClick={() => navigate('/veiculos')}>
          ← Voltar
        </Button>
      </div>

      {/* box fixo — identificação + abas. só o conteúdo abaixo muda por aba */}
      <div className="border border-(--nos-border) bg-(--nos-surface)">

        <div className="flex items-start justify-between px-6 py-5">

          <div className="flex items-center gap-4">

            <div className="flex h-12 w-12 shrink-0 items-center justify-center border border-(--nos-red)/40 bg-(--nos-red)/10 text-sm font-bold text-(--nos-red)">
              {veiculo.placa.replace(/[^A-Za-z]/g, '').slice(0, 3).toUpperCase()}
            </div>

            <div>
              <div className="mb-1 flex items-center gap-3">
                <h1 className="text-sm uppercase tracking-widest text-(--nos-text)">
                  {formatarPlaca(veiculo.placa)}
                </h1>
                <Badge status={veiculo.ativo ? 'ativo' : 'inativo'} />
              </div>

              <p className="text-xs text-(--nos-text-muted)">
                {formatarVeiculo(veiculo)}
                {veiculo.cor ? ` · ${veiculo.cor}` : ''}
              </p>

              {cliente && (
                <button
                  type="button"
                  onClick={() => navigate(`/clientes/${cliente.id}`)}
                  className="mt-2 flex items-center gap-2 text-[10px] uppercase tracking-widest text-(--nos-text-faint) hover:text-(--nos-red)"
                >
                  <span>// CLIENTE</span>
                  <span className="text-(--nos-text)">{cliente.nome}</span>
                  <span>
                    {formatarDocumento(cliente.documento)}
                    {' · '}
                    {formatarTelefone(cliente.telefone)}
                  </span>
                </button>
              )}
            </div>

          </div>

          <Button
            variant="ghost"
            className={
              veiculo.ativo
                ? 'hover:!text-(--nos-red)'
                : 'hover:!text-(--nos-success)'
            }
            onClick={abrirConfirmacao}
          >
            {veiculo.ativo ? 'Inativar' : 'Reativar'}
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
            {!veiculo.ativo && (
              <p className="text-[10px] uppercase tracking-widest text-(--nos-text-faint)">
                Veículo inativo — reative para editar.
              </p>
            )}

            <fieldset disabled={!veiculo.ativo} className="space-y-5 disabled:opacity-60">
              <VeiculoCampos
                formulario={formulario}
                setFormulario={setFormulario}
                erros={erros}
                setErros={setErros}
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

            {veiculo.ativo && (
              <div className="flex justify-end">
                <Button variant="primary" type="submit" loading={salvando}>
                  Salvar alterações
                </Button>
              </div>
            )}
          </form>
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
              ordens.map((ordem, indice) => (
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

                  <p className="truncate text-xs text-(--nos-text-muted)">
                    {ordem.descricaoProblema}
                  </p>

                  <div className="flex items-center gap-2">
                    <Badge status={statusOSParaPreset(ordem.status)} />
                    <span className="text-[10px] text-(--nos-text-faint)">
                      {formatarData(ordem.dataAbertura)}
                    </span>
                  </div>

                  <span className="text-right text-xs text-(--nos-text)">
                    {formatarMoeda(ordem.valorTotal)}
                  </span>
                </button>
              ))}

            {veiculo.ativo && cliente?.ativo && (
              <div className="flex justify-end border-t border-(--nos-border) px-4 py-3">
                <Button variant="secondary" size="sm" onClick={() => navigate('/ordens/nova', {
                  state: {
                    cliente: { id: cliente.id, nome: cliente.nome },
                    veiculo,
                  },
                })}>
                  + Nova OS
                </Button>
              </div>
            )}
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
