// fonte única de verdade para cores/labels do enum StatusOS do backend.
// usado tanto pelo Badge (listagem) quanto pelo seletor de status (Nova/Editar OS) para garantir que a cor de cada status seja sempre a mesma
// em qualquer lugar da aplicação.

export const STATUS_OS = [
  {
    label: 'Aguardando',
    value: 0,
    preset: 'aguardando',
    color: 'text-(--nos-violet)',
    dot: 'bg-(--nos-violet)',
    border: 'border-(--nos-violet)/40',
  },
  {
    label: 'Aguardando Peças',
    value: 1,
    preset: 'aguardando_pecas',
    color: 'text-(--nos-amber)',
    dot: 'bg-(--nos-amber)',
    border: 'border-(--nos-amber)/40',
  },
  {
    label: 'Em Execução',
    value: 2,
    preset: 'em_execucao',
    color: 'text-(--nos-sky)',
    dot: 'bg-(--nos-sky)',
    border: 'border-(--nos-sky)/40',
  },
  {
    label: 'Em Teste',
    value: 3,
    preset: 'em_teste',
    color: 'text-(--nos-orange)',
    dot: 'bg-(--nos-orange)',
    border: 'border-(--nos-orange)/40',
  },
  {
    label: 'Concluída',
    value: 4,
    preset: 'concluida',
    color: 'text-(--nos-green)',
    dot: 'bg-(--nos-green)',
    border: 'border-(--nos-green)/40',
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
