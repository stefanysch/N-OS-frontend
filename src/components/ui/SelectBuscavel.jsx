import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { createPortal } from 'react-dom'

/**
 * N-OS SelectBuscavel
 *
 * Combobox: mostra o valor selecionado como um <select> normal, mas ao focar
 * vira um campo de busca que filtra as opções conforme o usuário digita.
 *
 * Uso:
 *   <SelectBuscavel
 *     value={clienteId}
 *     onChange={(valor) => setClienteId(valor)}
 *     options={clientes.map((c) => ({ value: c.id, label: c.nome }))}
 *     placeholder="Selecione um cliente..."
 *     className="w-full border border-(--nos-border-2) bg-(--nos-bg) px-3 py-2 font-mono text-xs"
 *   />
 *
 * onChange sempre recebe o value como string (igual ao <select> nativo), ou
 * '' quando o campo é limpo.
 */

const ALTURA_LISTA = 224

const DIACRITICOS = /[̀-ͯ]/g

function normalizar(texto) {
  return String(texto ?? '')
    .normalize('NFD')
    .replace(DIACRITICOS, '')
    .toLowerCase()
    .trim()
}

export default function SelectBuscavel({
  value,
  onChange,
  options = [],
  placeholder = 'Selecione...',
  semResultadoTexto = 'Nenhum resultado',
  disabled = false,
  id,
  className = '',
}) {
  const [aberto, setAberto] = useState(false)
  const [busca, setBusca] = useState('')
  const [indiceAtivo, setIndiceAtivo] = useState(0)
  const [coords, setCoords] = useState(null)

  const containerRef = useRef(null)
  const inputRef = useRef(null)
  const listaRef = useRef(null)

  const selecionada = useMemo(
    () =>
      options.find(
        (opcao) => String(opcao.value) === String(value)
      ) ?? null,
    [options, value]
  )

  const filtradas = useMemo(() => {
    const termo = normalizar(busca)

    if (!termo) return options

    return options.filter((opcao) =>
      normalizar(opcao.label).includes(termo)
    )
  }, [options, busca])

  function posicionar() {
    const el = containerRef.current

    if (!el) return

    const r = el.getBoundingClientRect()
    const espacoAbaixo = window.innerHeight - r.bottom
    const paraCima =
      espacoAbaixo < ALTURA_LISTA && r.top > espacoAbaixo

    setCoords({
      left: r.left,
      width: r.width,
      top: paraCima ? undefined : r.bottom + 4,
      bottom: paraCima
        ? window.innerHeight - r.top + 4
        : undefined,
    })
  }

  useLayoutEffect(() => {
    if (!aberto) return

    posicionar()

    const aoMover = () => posicionar()

    // capture: pega scroll de qualquer ancestral (listas com overflow)
    window.addEventListener('scroll', aoMover, true)
    window.addEventListener('resize', aoMover)

    return () => {
      window.removeEventListener('scroll', aoMover, true)
      window.removeEventListener('resize', aoMover)
    }
  }, [aberto])

  useEffect(() => {
    if (!aberto) return

    function foraDoComponente(alvo) {
      return (
        !containerRef.current?.contains(alvo) &&
        !listaRef.current?.contains(alvo)
      )
    }

    function aoApontar(evento) {
      if (foraDoComponente(evento.target)) fechar()
    }

    // fecha também quando o foco vai pra outro campo (ex.: abrir outro
    // combobox) sem um clique que dispare o pointerdown acima.
    function aoFocar(evento) {
      if (foraDoComponente(evento.target)) fechar()
    }

    document.addEventListener('pointerdown', aoApontar)
    document.addEventListener('focusin', aoFocar)

    return () => {
      document.removeEventListener('pointerdown', aoApontar)
      document.removeEventListener('focusin', aoFocar)
    }
  }, [aberto])

  useEffect(() => {
    if (!aberto) return

    const ativo = listaRef.current?.querySelector(
      '[data-ativo="true"]'
    )

    ativo?.scrollIntoView({ block: 'nearest' })
  }, [indiceAtivo, aberto])

  function abrir() {
    if (disabled || aberto) return

    setBusca('')
    setIndiceAtivo(0)
    setAberto(true)

    requestAnimationFrame(() => inputRef.current?.focus())
  }

  function fechar() {
    setAberto(false)
    setBusca('')
  }

  function selecionar(opcao) {
    onChange(opcao ? String(opcao.value) : '')
    fechar()
  }

  function aoTeclar(evento) {
    if (evento.key === 'ArrowDown') {
      evento.preventDefault()

      if (!aberto) {
        abrir()
        return
      }

      setIndiceAtivo((i) =>
        Math.min(i + 1, filtradas.length - 1)
      )
    } else if (evento.key === 'ArrowUp') {
      evento.preventDefault()
      setIndiceAtivo((i) => Math.max(i - 1, 0))
    } else if (evento.key === 'Enter') {
      if (aberto && filtradas[indiceAtivo]) {
        evento.preventDefault()
        selecionar(filtradas[indiceAtivo])
      }
    } else if (evento.key === 'Escape') {
      if (aberto) {
        evento.preventDefault()
        fechar()
      }
    } else if (evento.key === 'Tab') {
      fechar()
    }
  }

  const textoFechado = selecionada?.label ?? ''

  return (
    <div ref={containerRef} className="relative">
      <div
        onClick={abrir}
        className={[
          className,
          'flex items-center gap-2',
          'focus-within:border-(--nos-red)',
          disabled
            ? 'pointer-events-none opacity-30'
            : 'cursor-text',
        ].join(' ')}
      >
        <input
          ref={inputRef}
          id={id}
          type="text"
          autoComplete="off"
          disabled={disabled}
          value={aberto ? busca : textoFechado}
          placeholder={placeholder}
          onChange={(evento) => {
            if (!aberto) setAberto(true)
            setBusca(evento.target.value)
            setIndiceAtivo(0)
          }}
          onFocus={abrir}
          onKeyDown={aoTeclar}
          className="w-full min-w-0 truncate bg-transparent outline-none placeholder-(--nos-text-faint)"
        />

        {selecionada && !disabled && (
          <button
            type="button"
            tabIndex={-1}
            title="Limpar"
            onClick={(evento) => {
              evento.stopPropagation()
              selecionar(null)
            }}
            className="shrink-0 leading-none text-(--nos-text-muted) transition-colors hover:text-(--nos-red)"
          >
            ×
          </button>
        )}

        <span className="shrink-0 text-[8px] text-(--nos-text-muted)">
          ▼
        </span>
      </div>

      {aberto &&
        coords &&
        createPortal(
          <div
            ref={listaRef}
            style={{
              position: 'fixed',
              left: coords.left,
              top: coords.top,
              bottom: coords.bottom,
              width: coords.width,
              maxHeight: ALTURA_LISTA,
              zIndex: 70,
            }}
            className="overflow-y-auto border border-(--nos-border-2) bg-(--nos-surface) py-1 font-mono text-xs shadow-lg shadow-black/40"
          >
            {filtradas.length === 0 ? (
              <p className="px-3 py-2 text-(--nos-text-faint)">
                {semResultadoTexto}
              </p>
            ) : (
              filtradas.map((opcao, indice) => {
                const ativo = indice === indiceAtivo
                const atual =
                  String(opcao.value) === String(value)

                return (
                  <button
                    key={opcao.value}
                    type="button"
                    data-ativo={ativo}
                    onMouseEnter={() => setIndiceAtivo(indice)}
                    onClick={() => selecionar(opcao)}
                    className={[
                      'block w-full truncate px-3 py-2 text-left transition-colors',
                      ativo
                        ? 'bg-(--nos-surface-2) text-(--nos-text)'
                        : 'text-(--nos-text-muted)',
                      atual ? '!text-(--nos-red)' : '',
                    ].join(' ')}
                  >
                    {opcao.label}
                  </button>
                )
              })
            )}
          </div>,
          document.body
        )}
    </div>
  )
}
