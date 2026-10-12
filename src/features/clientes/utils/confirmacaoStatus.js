import { formatarPlaca, formatarVeiculo } from '@/utils/formatters'

function itemVeiculo(veiculo) {
  return {
    chave: veiculo.id,
    titulo: formatarPlaca(veiculo.placa),
    subtitulo: formatarVeiculo(veiculo),
  }
}

// inativar: só os veículos ativos são afetados.
// reativar: todos os veículos do cliente voltam a ficar ativos.
export function montarConfirmacaoStatusCliente(cliente, veiculos = []) {
  const afetados = cliente.ativo
    ? veiculos.filter((veiculo) => veiculo.ativo)
    : veiculos

  const acao = cliente.ativo ? 'inativar' : 'reativar'
  const participio = cliente.ativo ? 'inativados' : 'reativados'

  return {
    ativo: cliente.ativo,
    mensagem:
      afetados.length > 0
        ? `Deseja ${acao} "${cliente.nome}"? Os veículos abaixo também serão ${participio}.`
        : `Deseja ${acao} "${cliente.nome}"?`,
    tituloItens: `Veículos que serão ${participio} (${afetados.length})`,
    itens: afetados.map(itemVeiculo),
  }
}
