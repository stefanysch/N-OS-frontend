/**
 * N-OS Badge
 *
 * Uso:
 *   <Badge status="ativo" />
 *   <Badge status="aguardando_pecas" />
 *   <Badge status="em_execucao" />
 *   <Badge label="Custom" color="text-(--nos-sky)" dot="bg-(--nos-sky)" />
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
  ativo:            { label: 'Ativo',             color: 'text-(--nos-green)', dot: 'bg-(--nos-green)' },
  inativo:          { label: 'Inativo',           color: 'text-(--nos-text-muted)', dot: 'bg-(--nos-text-faint)' },

  ...presetsStatusOS,

  // genéricos
  pendente:         { label: 'Pendente',          color: 'text-(--nos-amber)',   dot: 'bg-(--nos-amber)'   },
  em_andamento:     { label: 'Em andamento',      color: 'text-(--nos-sky)',     dot: 'bg-(--nos-sky)'     },
  concluido:        { label: 'Concluído',         color: 'text-(--nos-green)', dot: 'bg-(--nos-green)' },
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