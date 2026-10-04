import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

const ATRASO_BUSCA_MS = 400
const TAMANHO_PAGINA = 20

const SEM_DADOS = { items: [], totalItems: 0, totalPages: 0 }

/**
 * Estado de uma listagem paginada, guardado na query string da URL:
 *   ?page=2&sort=nome&dir=desc&q=joao
 *
 * `buscar` deve ser uma função estável (ex.: método de um service) que recebe
 * { page, pageSize, sort, dir, q } e devolve { items, totalItems, totalPages }.
 */
export function useListaPaginada({ buscar, ordenacaoPadrao }) {
  const [params, setParams] = useSearchParams()

  const page = Math.max(1, Number(params.get('page')) || 1)
  const sort = params.get('sort') ?? ordenacaoPadrao.sort
  const dir = params.get('dir') ?? ordenacaoPadrao.dir
  const q = params.get('q') ?? ''

  const [busca, setBusca] = useState(q)

  // `versao` só serve para forçar nova busca com os mesmos filtros (recarregar)
  const [versao, setVersao] = useState(0)

  // resultado da última busca concluída e a chave (filtros + versão) a que pertence
  const [resultado, setResultado] = useState({ chave: null, dados: SEM_DADOS, erro: false })

  const chave = `${page}|${sort}|${dir}|${q}|${versao}`

  // "carregando" é derivado: o resultado guardado ainda não é o dos filtros atuais
  const carregandoAgora = resultado.chave !== chave
  const jaCarregou = resultado.chave !== null

  const atualizarParams = useCallback((mudancas) => {
    setParams((atual) => {
      const proximo = new URLSearchParams(atual)

      for (const [campo, valor] of Object.entries(mudancas)) {
        if (valor === null || valor === '') {
          proximo.delete(campo)
        } else {
          proximo.set(campo, String(valor))
        }
      }

      return proximo
    }, { replace: true })
  }, [setParams])

  // busca com debounce: só vai para a URL (e para o servidor) depois de parar de digitar
  useEffect(() => {
    const termo = busca.trim()

    if (termo === q) return

    const temporizador = setTimeout(() => {
      atualizarParams({ q: termo, page: null })
    }, ATRASO_BUSCA_MS)

    return () => clearTimeout(temporizador)
  }, [busca, q, atualizarParams])

  useEffect(() => {
    let cancelado = false

    buscar({ page, pageSize: TAMANHO_PAGINA, sort, dir, q })
      .then((resposta) => {
        if (cancelado) return

        setResultado({
          chave,
          erro: false,
          dados: {
            items: resposta?.items ?? [],
            totalItems: resposta?.totalItems ?? 0,
            totalPages: resposta?.totalPages ?? 0,
          },
        })
      })
      .catch(() => {
        if (cancelado) return

        setResultado({ chave, erro: true, dados: SEM_DADOS })
      })

    // descarta a resposta se os filtros mudaram antes de ela chegar
    return () => {
      cancelado = true
    }
  }, [buscar, page, sort, dir, q, chave])

  // página fora do intervalo (ex.: URL antiga): volta para a última existente
  useEffect(() => {
    const { totalPages } = resultado.dados

    if (!carregandoAgora && totalPages > 0 && page > totalPages) {
      atualizarParams({ page: totalPages > 1 ? totalPages : null })
    }
  }, [carregandoAgora, resultado.dados, page, atualizarParams])

  function ordenarPor(campo) {
    const novaDirecao = campo === sort && dir === 'asc' ? 'desc' : 'asc'

    atualizarParams({ sort: campo, dir: novaDirecao, page: null })
  }

  function irParaPagina(proxima) {
    atualizarParams({ page: proxima > 1 ? proxima : null })
  }

  const recarregar = useCallback(() => {
    setVersao((atual) => atual + 1)
  }, [])

  return {
    itens: resultado.dados.items,
    totalItems: resultado.dados.totalItems,
    totalPages: resultado.dados.totalPages,
    page,
    sort,
    dir,
    busca,
    setBusca,
    ordenarPor,
    irParaPagina,
    // sem dados para mostrar (1a carga ou nova tentativa após erro): tela "Carregando..."
    carregando: carregandoAgora && (!jaCarregou || resultado.erro),
    // já há tabela na tela: ela fica visível, só esmaecida
    atualizando: carregandoAgora && jaCarregou && !resultado.erro,
    erro: !carregandoAgora && resultado.erro,
    recarregar,
  }
}
