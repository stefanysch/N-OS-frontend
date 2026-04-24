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
    <div className={['px-6 py-5 space-y-5', className].join(' ')}>
      {children}
    </div>
  )
}

function ModalFooter({ children }) {
  return (
    <div className="flex items-center justify-end gap-3 border-t border-[#2a2a2a] px-6 py-4">
      {children}
    </div>
  )
}

function ModalSection({ title, children }) {
  return (
    <div>
      {title && (
        <div className="mb-3 border-b border-[#1e1e1e] pb-1">
          <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#444]">
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
  // bloqueia scroll do body quando aberto
  useEffect(() => {
    if (aberto) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [aberto])

  // fecha com ESC
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape' && aberto) onFechar()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [aberto, onFechar])

  if (!aberto) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* overlay */}
      <div
        className="absolute inset-0 bg-black/85 backdrop-blur-sm"
        onClick={fecharNoOverlay ? onFechar : undefined}
      />

      {/* painel */}
      <div
        className={[
          'relative z-10 w-full',
          sizes[size] ?? sizes.md,
          'border border-[#2a2a2a] bg-[#111111] shadow-2xl',
          'animate-in fade-in slide-in-from-bottom-2 duration-200',
        ].join(' ')}
        onClick={(e) => e.stopPropagation()}
      >
        {/* header */}
        <div className="flex items-start justify-between border-b border-[#2a2a2a] px-6 py-4">
          <div>
            {subtitulo && (
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#e11d48] mb-0.5">
                {subtitulo}
              </p>
            )}
            {titulo && (
              <h2 className="font-mono text-sm uppercase tracking-widest text-white">
                {titulo}
              </h2>
            )}
          </div>

          <div className="flex items-center gap-4 ml-4 shrink-0">
            {badge && (
              <span className="font-mono text-xs text-[#444]">{badge}</span>
            )}
            <button
              onClick={onFechar}
              className="font-mono text-lg leading-none text-[#444] transition-colors hover:text-[#e11d48]"
              aria-label="Fechar modal"
            >
              ✕
            </button>
          </div>
        </div>

        {/* conteúdo */}
        {children}
      </div>
    </div>
  )
}

// exporta sub-componentes como propriedades
Modal.Body    = ModalBody
Modal.Footer  = ModalFooter
Modal.Section = ModalSection