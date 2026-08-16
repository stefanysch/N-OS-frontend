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
    'focus:outline-none focus-visible:ring-1 focus-visible:ring-(--nos-red)',
  ].join(' '),

  variants: {
    primary: [
      'bg-(--nos-red) border-(--nos-red) text-black',
      'hover:bg-(--nos-red-hover) hover:border-(--nos-red-hover)',
    ].join(' '),

    secondary: [
      'bg-transparent border-(--nos-red) text-(--nos-red)',
      'hover:bg-(--nos-red) hover:text-black',
    ].join(' '),

    ghost: [
      'bg-transparent border-transparent text-(--nos-text-muted)',
      'hover:text-(--nos-text) hover:border-transparent',
    ].join(' '),

    danger: [
      'bg-transparent border-(--nos-red)/40 text-(--nos-red)/70',
      'hover:border-(--nos-red) hover:text-(--nos-red) hover:bg-(--nos-red-dim)',
    ].join(' '),

    outline: [
      'bg-transparent border-(--nos-border-2) text-(--nos-text-dim)',
      'hover:border-(--nos-text-muted) hover:text-(--nos-text)',
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