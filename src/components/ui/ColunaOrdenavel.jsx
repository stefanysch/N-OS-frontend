/**
 * N-OS ColunaOrdenavel
 *
 * Título de coluna de tabela. Sem `campo`, é só texto; com `campo`, vira um
 * botão que ordena por ele (alterna asc/desc) e mostra a seta quando ativo.
 *
 * Uso:
 *   <ColunaOrdenavel rotulo="// NOME" campo="nome" sort={sort} dir={dir} onOrdenar={ordenarPor} />
 *   <ColunaOrdenavel rotulo="// ID" />
 */
export default function ColunaOrdenavel({
  rotulo,
  campo,
  sort,
  dir,
  onOrdenar,
  className = '',
}) {
  const classesBase = 'text-[10px] uppercase tracking-[0.15em]'

  if (!campo) {
    return <span className={[classesBase, className].join(' ')}>{rotulo}</span>
  }

  const ativa = campo === sort

  return (
    <button
      type="button"
      onClick={() => onOrdenar(campo)}
      className={[
        classesBase,
        'inline-flex items-center gap-1 text-left transition-colors',
        'hover:text-(--nos-text)',
        ativa ? 'text-(--nos-text)' : '',
        className,
      ].join(' ')}
    >
      {rotulo}

      {ativa && (
        <span className="text-(--nos-red)">
          {dir === 'desc' ? '↓' : '↑'}
        </span>
      )}
    </button>
  )
}
