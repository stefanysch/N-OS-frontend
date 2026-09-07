import { useEffect, useState } from 'react'

import { dashboardService } from '../services/dashboardService'

import { formatarData, formatarMoeda } from '@/utils/formatters'

function paraDataInput(data) {
  return data.toISOString().slice(0, 10)
}

function dataInicialPadrao() {
  const hoje = new Date()
  const inicio = new Date(hoje)
  inicio.setDate(inicio.getDate() - 29)
  return paraDataInput(inicio)
}

function dataFinalPadrao() {
  return paraDataInput(new Date())
}

export default function SecaoFaturamento({ mostrarValores }) {
  const [dataInicio, setDataInicio] = useState(dataInicialPadrao)
  const [dataFim, setDataFim] = useState(dataFinalPadrao)

  const [dados, setDados] = useState(null)
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState(null)

  async function carregar() {
    setCarregando(true)
    setErro(null)

    try {
      const resultado = await dashboardService.obterFaturamento(
        dataInicio,
        dataFim
      )

      setDados(resultado)

      // reflete o período que o backend efetivamente aplicou
      // (ele corrige datas invertidas ou um intervalo grande demais)
      setDataInicio(resultado.periodoInicio)
      setDataFim(resultado.periodoFim)
    } catch {
      setErro('Falha ao carregar o faturamento.')
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => {
    // enquanto os valores estiverem ocultos, nem busca o faturamento —
    // evita expor o dado (mesmo que só no dev tools) sem necessidade.
    if (!mostrarValores) return

    carregar()
  }, [mostrarValores, dataInicio, dataFim])

  const maiorValorDia =
    dados?.porDia.reduce(
      (maior, dia) => Math.max(maior, dia.valor),
      0
    ) ?? 0

  return (
    <section>
      <p className="mb-4 text-[10px] uppercase tracking-[0.25em] text-(--nos-red)">
        // FATURAMENTO
      </p>

      {!mostrarValores ? (
        <div className="flex h-40 flex-col items-center justify-center gap-2 border border-dashed border-(--nos-border-2) bg-(--nos-surface) text-center">
          <p className="text-xs uppercase tracking-widest text-(--nos-text-faint)">
            Valores ocultos
          </p>
          <p className="text-[10px] text-(--nos-text-faint)">
            Clique no ícone de olho, no topo da página, pra ver
          </p>
        </div>
      ) : (
        <div className="border border-(--nos-border) bg-(--nos-surface) p-5">

          <div className="mb-4 flex flex-wrap items-end justify-between gap-4">

            <div className="flex items-end gap-3">
              <div>
                <label className="mb-1 block text-[9px] uppercase tracking-widest text-(--nos-text-muted)">
                  // DE
                </label>
                <input
                  type="date"
                  value={dataInicio}
                  max={dataFim}
                  onChange={(e) => setDataInicio(e.target.value)}
                  className="border border-(--nos-border-2) bg-(--nos-bg) px-2 py-1.5 font-mono text-xs text-(--nos-text) focus:border-(--nos-red) focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-[9px] uppercase tracking-widest text-(--nos-text-muted)">
                  // ATÉ
                </label>
                <input
                  type="date"
                  value={dataFim}
                  min={dataInicio}
                  onChange={(e) => setDataFim(e.target.value)}
                  className="border border-(--nos-border-2) bg-(--nos-bg) px-2 py-1.5 font-mono text-xs text-(--nos-text) focus:border-(--nos-red) focus:outline-none"
                />
              </div>
            </div>

            <div className="text-right">
              <p className="text-[10px] uppercase tracking-widest text-(--nos-text-muted)">
                Total no período
              </p>
              <p className="text-xl text-(--nos-text)">
                {carregando ? '...' : formatarMoeda(dados?.total ?? 0)}
              </p>
            </div>

          </div>

          {erro && (
            <p className="mb-3 text-[11px] text-(--nos-red)">{erro}</p>
          )}

          {dados && !erro && (
            <>
              <div className="flex h-32 items-end gap-[2px]">
                {dados.porDia.map((dia) => (
                  <div
                    key={dia.dia}
                    title={`${formatarData(dia.dia)} — ${formatarMoeda(dia.valor)}`}
                    className="flex-1 bg-(--nos-red)/60 transition-colors hover:bg-(--nos-red)"
                    style={{
                      height:
                        maiorValorDia > 0
                          ? `${Math.max((dia.valor / maiorValorDia) * 100, 2)}%`
                          : '2%',
                    }}
                  />
                ))}
              </div>

              <div className="mt-2 flex justify-between text-[10px] text-(--nos-text-faint)">
                <span>{formatarData(dados.periodoInicio)}</span>
                <span>{formatarData(dados.periodoFim)}</span>
              </div>
            </>
          )}

        </div>
      )}
    </section>
  )
}
