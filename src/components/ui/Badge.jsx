/**
 * N-OS Badge
 *
 * Uso:
 *   <Badge status="ativo" />
 *   <Badge status="inativo" />
 *   <Badge status="pendente" />
 *   <Badge status="em_andamento" />
 *   <Badge status="concluido" />
 *   <Badge label="Custom" color="red" />
 */

const presets = {
  ativo:         { label: 'Ativo',          color: 'text-emerald-500',  dot: 'bg-emerald-500' },
  inativo:       { label: 'Inativo',        color: 'text-[#444]',       dot: 'bg-[#333]' },
  pendente:      { label: 'Pendente',       color: 'text-amber-400',    dot: 'bg-amber-400' },
  em_andamento:  { label: 'Em andamento',   color: 'text-sky-400',      dot: 'bg-sky-400' },
  concluido:     { label: 'Concluído',      color: 'text-emerald-500',  dot: 'bg-emerald-500' },
  cancelado:     { label: 'Cancelado',      color: 'text-[#e11d48]',    dot: 'bg-[#e11d48]' },
  aguardando:    { label: 'Aguardando',     color: 'text-violet-400',   dot: 'bg-violet-400' },
}

export default function Badge({ status, label, className = '' }) {
  const preset = presets[status] ?? { label: label ?? status, color: 'text-[#555]', dot: 'bg-[#555]' }

  return (
    <span
      className={[
        'inline-flex items-center gap-1.5',
        'font-mono text-[10px] uppercase tracking-widest',
        preset.color,
        className,
      ].join(' ')}
    >
      <span className={['inline-block h-1.5 w-1.5 rounded-full', preset.dot].join(' ')} />
      {preset.label}
    </span>
  )
}