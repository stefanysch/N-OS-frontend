// fonte única de verdade para cores/labels do enum StatusOS do backend.
// usado tanto pelo Badge (listagem) quanto pelo seletor de status (Nova/Editar OS) para garantir que a cor de cada status seja sempre a mesma
// em qualquer lugar da aplicação.

export const STATUS_OS = [
  {
    label: 'Aguardando',
    value: 0,
    preset: 'aguardando',
    color: 'text-violet-400',
    dot: 'bg-violet-400',
    border: 'border-violet-400/40',
  },
  {
    label: 'Aguardando Peças',
    value: 1,
    preset: 'aguardando_pecas',
    color: 'text-amber-400',
    dot: 'bg-amber-400',
    border: 'border-amber-400/40',
  },
  {
    label: 'Em Execução',
    value: 2,
    preset: 'em_execucao',
    color: 'text-sky-400',
    dot: 'bg-sky-400',
    border: 'border-sky-400/40',
  },
  {
    label: 'Em Teste',
    value: 3,
    preset: 'em_teste',
    color: 'text-orange-400',
    dot: 'bg-orange-400',
    border: 'border-orange-400/40',
  },
  {
    label: 'Concluída',
    value: 4,
    preset: 'concluida',
    color: 'text-emerald-500',
    dot: 'bg-emerald-500',
    border: 'border-emerald-500/40',
  },
]

export function obterStatus(valor) {
  return (
    STATUS_OS.find(
      (status) => status.value === Number(valor)
    ) ?? STATUS_OS[0]
  )
}

export function statusOSParaPreset(valor) {
  return obterStatus(valor).preset
}
