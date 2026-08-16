/**
 * N-OS Badge
 *
 * Uso:
 *   <Badge status="ativo" />
 *   <Badge status="aguardando_pecas" />
 *   <Badge status="em_execucao" />
 *   <Badge label="Custom" color="text-sky-400" dot="bg-sky-400" />
 */

import { STATUS_OS } from '@/utils/statusOS'

const presetsStatusOS = Object.fromEntries(
  STATUS_OS.map((status) => [
    status.preset,
    { label: status.label, color: status.color, dot: status.dot },
  ])
)

const presets = {
  // entidade
  ativo:            { label: 'Ativo',             color: 'text-emerald-500', dot: 'bg-emerald-500' },
  inativo:          { label: 'Inativo',           color: 'text-(--nos-text-muted)', dot: 'bg-(--nos-text-faint)' },

  ...presetsStatusOS,

  // genéricos
  pendente:         { label: 'Pendente',          color: 'text-amber-400',   dot: 'bg-amber-400'   },
  em_andamento:     { label: 'Em andamento',      color: 'text-sky-400',     dot: 'bg-sky-400'     },
  concluido:        { label: 'Concluído',         color: 'text-emerald-500', dot: 'bg-emerald-500' },
  cancelado:        { label: 'Cancelado',         color: 'text-(--nos-red)', dot: 'bg-(--nos-red)' },
}

export default function Badge({ status, label, color, dot, className = '' }) {
  const preset = presets[status] ?? {
    label: label ?? status ?? '—',
    color: color ?? 'text-(--nos-text-muted)',
    dot:   dot   ?? 'bg-(--nos-text-muted)',
  }

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