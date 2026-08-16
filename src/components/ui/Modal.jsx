/**
 * N-OS Modal Base
 *
 * Uso:
 *   <Modal
 *     aberto={true}
 *     onFechar={fn}
 *     titulo="// NOVA PEÇA"
 *     subtitulo="Produtos / Peças"
 *     badge="#0001"
 *     size="md"          // sm | md | lg | xl
 *     fecharNoOverlay    // fecha ao clicar fora (padrão: true)
 *   >
 *     <Modal.Body> ... </Modal.Body>
 *     <Modal.Footer>
 *       <Button variant="ghost" onClick={fn}>Cancelar</Button>
 *       <Button variant="secondary" onClick={fn}>Salvar</Button>
 *       <Button variant="primary" onClick={fn}>Salvar e Continuar →</Button>
 *     </Modal.Footer>
 *   </Modal>
 */

import { useEffect } from 'react'

const sizes = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
}

// sub-componentes

function ModalBody({ children, className = '' }) {
  return (
    <div
      className={[
        'space-y-5 px-6 py-5',
        className,
      ].join(' ')}
    >
      {children}
    </div>
  )
}

function ModalFooter({ children }) {
  return (
    <div className="flex items-center justify-end gap-3 border-t border-(--nos-border-2) px-6 py-4">
      {children}
    </div>
  )
}

function ModalSection({ title, children }) {
  return (
    <div>
      {title && (
        <div className="mb-3 border-b border-(--nos-border) pb-1">
          <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-(--nos-text-muted)">
            {title}
          </span>
        </div>
      )}

      {children}
    </div>
  )
}

// componente principal
export default function Modal({
  aberto,
  onFechar,
  titulo,
  subtitulo,
  badge,
  size = 'md',
  fecharNoOverlay = true,
  children,
}) {
  // bloqueia scroll do body quando o modal está aberto
  useEffect(() => {
    if (aberto) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [aberto])

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape' && aberto) {
        onFechar()
      }
    }

    document.addEventListener('keydown', handleKey)

    return () => {
      document.removeEventListener('keydown', handleKey)
    }
  }, [aberto, onFechar])

  if (!aberto) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">

      <div
        className="absolute inset-0 bg-black/85 backdrop-blur-sm"
        onClick={fecharNoOverlay ? onFechar : undefined}
      />

      <div
        className={[
          'relative z-10 w-full',
          sizes[size] ?? sizes.md,
          'border border-(--nos-border-2)',
          'bg-(--nos-surface)',
          'text-(--nos-text)',
          'shadow-2xl',
          'animate-in fade-in slide-in-from-bottom-2 duration-200',
        ].join(' ')}
        onClick={(e) => e.stopPropagation()}
      >

        <div className="flex items-start justify-between border-b border-(--nos-border-2) px-6 py-4">

          <div>
            {subtitulo && (
              <p className="mb-0.5 font-mono text-[10px] uppercase tracking-[0.2em] text-(--nos-red)">
                {subtitulo}
              </p>
            )}

            {titulo && (
              <h2 className="font-mono text-sm uppercase tracking-widest text-(--nos-text)">
                {titulo}
              </h2>
            )}
          </div>

          <div className="ml-4 flex shrink-0 items-center gap-4">

            {badge && (
              <span className="font-mono text-xs text-(--nos-text-muted)">
                {badge}
              </span>
            )}

            <button
              type="button"
              onClick={onFechar}
              className={[
                'font-mono text-lg leading-none',
                'text-(--nos-text-muted)',
                'transition-colors duration-150',
                'hover:text-(--nos-red)',
              ].join(' ')}
              aria-label="Fechar modal"
            >
              ✕
            </button>

          </div>
        </div>

        {children}

      </div>
    </div>
  )
}

Modal.Body = ModalBody
Modal.Footer = ModalFooter
Modal.Section = ModalSection