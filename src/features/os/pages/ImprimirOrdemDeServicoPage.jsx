import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { veiculoService } from '@/features/veiculos/services/veiculoService'
import { clienteService } from '@/features/clientes/services/clienteService'
import { empresaService } from '@/features/empresa/services/empresaService'
import { ordemDeServicoService } from '../services/ordemDeServicoService'

import { obterStatus } from '@/utils/statusOS'
import {
  formatarData,
  formatarDocumento,
  formatarMoeda,
  formatarPlaca,
  formatarTelefone,
} from '@/utils/formatters'

function nomeItem(item) {
  return item.pecaNome ?? item.servicoNome ?? '—'
}

export default function ImprimirOrdemDeServicoPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [ordem, setOrdem] = useState(null)
  const [veiculo, setVeiculo] = useState(null)
  const [cliente, setCliente] = useState(null)
  const [empresa, setEmpresa] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)

  async function carregar() {
    setCarregando(true)
    setErro(null)

    try {
      const dadosOrdem = await ordemDeServicoService.buscarPorId(id)
      const dadosVeiculo = await veiculoService.buscarPorId(dadosOrdem.veiculoId)

      const [dadosCliente, dadosEmpresa] = await Promise.all([
        clienteService.buscarPorId(dadosVeiculo.clienteId),
        // dados da empresa são só cosmético no cabeçalho — se falhar,
        // o PDF ainda deve funcionar, só cai no nome padrão.
        empresaService.obter().catch(() => null),
      ])

      setOrdem(dadosOrdem)
      setVeiculo(dadosVeiculo)
      setCliente(dadosCliente)
      setEmpresa(dadosEmpresa)
    } catch {
      setErro('Não foi possível carregar a ordem de serviço.')
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => {
    carregar()
  }, [id])

  function voltar() {
    // essa tela é aberta numa aba nova (window.open), então não tem
    // histórico anterior pra navigate(-1) voltar. Fecha a aba; se o
    // navegador não deixar (aba não foi aberta por script), cai pra
    // navegação normal.
    window.close()
    navigate(`/ordens/${id}/editar`)
  }

  if (carregando) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white font-mono text-xs uppercase tracking-widest text-gray-400">
        Carregando...
      </div>
    )
  }

  if (erro || !ordem) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-white font-mono text-black">
        <p className="text-xs text-red-600">{erro}</p>
        <button
          type="button"
          onClick={() => navigate('/ordens')}
          className="text-xs uppercase tracking-widest text-gray-500 underline"
        >
          Voltar para Ordens de Serviço
        </button>
      </div>
    )
  }

  const status = obterStatus(ordem.status)
  const subtotal = ordem.itens.reduce((acc, item) => acc + item.subtotal, 0)
  const nomeEmpresa =
    empresa?.configurada && empresa.nome ? empresa.nome : 'N-OS'

  return (
    <div className="min-h-screen bg-white font-mono text-black">

      <style>{`
        @media print {
          @page { size: A4; margin: 14mm; }
        }
      `}</style>

      <div className="print:hidden flex items-center justify-between border-b border-gray-200 bg-gray-50 px-6 py-4">
        <button
          type="button"
          onClick={voltar}
          className="text-xs uppercase tracking-widest text-gray-500 hover:text-black"
        >
          ← Voltar
        </button>

        <button
          type="button"
          onClick={() => window.print()}
          className="border border-black bg-black px-5 py-2 text-xs uppercase tracking-widest text-white hover:bg-gray-800"
        >
          Imprimir / Salvar PDF
        </button>
      </div>

      <div className="mx-auto max-w-3xl px-8 py-10 print:px-0 print:py-0">

        <div className="mb-8 flex items-start justify-between border-b border-black pb-4">
          <div>
            <p className="text-lg font-bold uppercase tracking-widest">
              {nomeEmpresa}
            </p>
            <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500">
              Ordem de serviço
            </p>
            {empresa?.configurada && (
              <p className="mt-1 text-[10px] text-gray-500">
                {[
                  empresa.documento && formatarDocumento(empresa.documento),
                  empresa.telefone && formatarTelefone(empresa.telefone),
                  empresa.email,
                ]
                  .filter(Boolean)
                  .join(' · ')}
                {empresa.endereco && (
                  <>
                    <br />
                    {empresa.endereco}
                  </>
                )}
              </p>
            )}
          </div>

          <div className="text-right">
            <p className="text-base font-bold">
              #{String(ordem.id).padStart(4, '0')}
            </p>
            <p className="text-[10px] uppercase tracking-widest text-gray-500">
              Abertura: {formatarData(ordem.dataAbertura)}
            </p>
            <p className="text-[10px] uppercase tracking-widest text-gray-500">
              Status: {status.label}
            </p>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-6">
          <div>
            <p className="mb-1 text-[10px] uppercase tracking-[0.2em] text-gray-500">
              Cliente
            </p>
            <p className="text-sm font-bold">{cliente?.nome}</p>
            <p className="text-xs text-gray-600">
              {formatarDocumento(cliente?.documento)}
            </p>
            <p className="text-xs text-gray-600">
              {formatarTelefone(cliente?.telefone)}
            </p>
          </div>

          <div>
            <p className="mb-1 text-[10px] uppercase tracking-[0.2em] text-gray-500">
              Veículo
            </p>
            <p className="text-sm font-bold">{formatarPlaca(veiculo?.placa)}</p>
            <p className="text-xs text-gray-600">
              {veiculo?.marca} {veiculo?.modelo} ({veiculo?.ano})
            </p>
            {veiculo?.cor && (
              <p className="text-xs text-gray-600">{veiculo.cor}</p>
            )}
          </div>
        </div>

        <div className="mb-5 border-b border-black pb-1">
          <p className="text-sm font-bold uppercase tracking-widest">
            Orçamento
          </p>
        </div>

        <div className="mb-6">
          <p className="mb-1 text-[10px] uppercase tracking-[0.2em] text-gray-500">
            Descrição do problema
          </p>
          <p className="whitespace-pre-wrap text-sm">
            {ordem.descricaoProblema}
          </p>
        </div>

        {ordem.observacoes && (
          <div className="mb-6">
            <p className="mb-1 text-[10px] uppercase tracking-[0.2em] text-gray-500">
              Observações
            </p>
            <p className="whitespace-pre-wrap text-sm">{ordem.observacoes}</p>
          </div>
        )}

        <table className="mb-6 w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-black text-left text-[10px] uppercase tracking-widest text-gray-500">
              <th className="py-2">Item</th>
              <th className="py-2 text-center">Qtd.</th>
              <th className="py-2 text-right">Valor unit.</th>
              <th className="py-2 text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {ordem.itens.map((item) => (
              <tr key={item.id} className="border-b border-gray-200">
                <td className="py-2">{nomeItem(item)}</td>
                <td className="py-2 text-center">{item.quantidade}</td>
                <td className="py-2 text-right">
                  {formatarMoeda(item.valorAplicado)}
                </td>
                <td className="py-2 text-right">
                  {formatarMoeda(item.subtotal)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mb-10 flex justify-end">
          <div className="w-56 space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Subtotal</span>
              <span>{formatarMoeda(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Desconto</span>
              <span>{formatarMoeda(ordem.desconto)}</span>
            </div>
            <div className="flex justify-between border-t border-black pt-1 text-base font-bold">
              <span>Total</span>
              <span>{formatarMoeda(ordem.valorTotal)}</span>
            </div>
          </div>
        </div>

        <p className="mb-6 text-[10px] uppercase tracking-widest text-gray-500">
          Formas de pagamento: Dinheiro · Cartão de Crédito · Cartão de Débito · Pix
        </p>

        <div className="mt-16 grid grid-cols-2 gap-10 text-center text-xs text-gray-500">
          <div>
            <div className="mb-1 border-t border-black pt-2">
              Assinatura do cliente
            </div>
          </div>
          <div>
            <div className="mb-1 border-t border-black pt-2">
              Data: ____ / ____ / ______
            </div>
          </div>
        </div>

        <p className="mt-16 text-center text-[9px] uppercase tracking-[0.2em] text-gray-400">
          N-OS / Nitro Service Order
        </p>

      </div>

    </div>
  )
}
