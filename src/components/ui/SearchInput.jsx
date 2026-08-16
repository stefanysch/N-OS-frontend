/**
 * N-OS SearchInput
 *
 * Uso:
 *   <SearchInput value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar por nome..." />
 */

export default function SearchInput({
  value,
  onChange,
  placeholder = 'Buscar...',
  className = '',
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={[
        'w-full max-w-xs border border-(--nos-border-2) bg-(--nos-surface)',
        'px-3 py-2 font-mono text-xs text-(--nos-text)',
        'placeholder-(--nos-text-faint)',
        'focus:border-(--nos-red) focus:outline-none',
        className,
      ].join(' ')}
    />
  )
}
