/**
 * N-OS Tabs
 *
 * Uso:
 *   <Tabs
 *     abas={[{ id: 'dados', label: 'Dados' }, { id: 'veiculos', label: 'Veículos' }]}
 *     abaAtiva={aba}
 *     onSelecionar={setAba}
 *   />
 */
export default function Tabs({ abas, abaAtiva, onSelecionar }) {
  return (
    <div className="flex border-t border-(--nos-border) px-2">
      {abas.map((aba) => (
        <button
          key={aba.id}
          type="button"
          onClick={() => onSelecionar(aba.id)}
          className={[
            'px-4 py-3 font-mono text-[11px] uppercase tracking-widest',
            'border-b-2 transition-colors duration-150',
            aba.id === abaAtiva
              ? 'border-(--nos-red) text-(--nos-text)'
              : 'border-transparent text-(--nos-text-muted) hover:text-(--nos-text)',
          ].join(' ')}
        >
          {aba.label}
        </button>
      ))}
    </div>
  )
}
