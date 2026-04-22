/**
 * N-OS Button
 *
 * Variantes:
 *   primary   — ação principal / "Salvar e Continuar" (fundo vermelho)
 *   secondary — ação secundária / "Salvar" (outline vermelho)
 *   ghost     — ação terciária / "Cancelar" (sem borda, só texto)
 *   danger    — ação destrutiva (outline vermelho com hover de destaque)
 *
 * Tamanhos: sm | md (padrão) | lg
 *
 * Uso:
 *   <Button variant="primary" onClick={fn}>Salvar e Continuar →</Button>
 *   <Button variant="secondary" size="sm" loading>Salvando...</Button>
 *   <Button variant="ghost" onClick={fechar}>Cancelar</Button>
 */

const styles = {
  base: [
    'inline-flex items-center justify-center gap-2',
    'font-mono uppercase tracking-widest',
    'border transition-all duration-150',
    'disabled:opacity-40 disabled:pointer-events-none',
    'focus:outline-none focus-visible:ring-1 focus-visible:ring-[#e11d48]',
  ].join(' '),

  variants: {
    primary: [
      'bg-[#e11d48] border-[#e11d48] text-black',
      'hover:bg-[#be1239] hover:border-[#be1239]',
    ].join(' '),

    secondary: [
      'bg-transparent border-[#e11d48] text-[#e11d48]',
      'hover:bg-[#e11d48] hover:text-black',
    ].join(' '),

    ghost: [
      'bg-transparent border-transparent text-[#555]',
      'hover:text-white hover:border-transparent',
    ].join(' '),

    danger: [
      'bg-transparent border-[#e11d48]/40 text-[#e11d48]/70',
      'hover:border-[#e11d48] hover:text-[#e11d48] hover:bg-[#e11d48]/10',
    ].join(' '),

    outline: [
      'bg-transparent border-[#2a2a2a] text-[#888]',
      'hover:border-[#444] hover:text-white',
    ].join(' '),
  },

  sizes: {
    sm: 'text-[9px] px-3 py-1.5',
    md: 'text-[10px] px-5 py-2',
    lg: 'text-xs px-7 py-3',
  },
}

const Spinner = () => (
  <svg
    className="animate-spin h-3 w-3"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
  </svg>
)

export default function Button({
  children,
  variant = 'secondary',
  size = 'md',
  loading = false,
  disabled = false,
  type = 'button',
  className = '',
  onClick,
  ...props
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={[
        styles.base,
        styles.variants[variant] ?? styles.variants.secondary,
        styles.sizes[size] ?? styles.sizes.md,
        className,
      ].join(' ')}
      {...props}
    >
      {loading && <Spinner />}
      {children}
    </button>
  )
}