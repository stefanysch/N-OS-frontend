// STATUS_OS e obterStatus vivem em @/utils/statusOS — fonte única também
// usada pelo Badge, pra listagem e formulários nunca mostrarem cores diferentes para o mesmo status.

export const ITEM_VAZIO = {
  tipo: 'peca',
  pecaId: '',
  servicoId: '',
  quantidade: 1,
  valorAplicado: 0,
}

export function calcularSubtotal(item) {
  return (
    Number(item.quantidade || 0) *
    Number(item.valorAplicado || 0)
  )
}

export function calcularSubtotalItens(itens) {
  return itens.reduce(
    (acc, item) => acc + calcularSubtotal(item),
    0
  )
}

export function formatarMoeda(valor) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(Number(valor || 0))
}
