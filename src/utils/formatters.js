import {
  aplicarMaskDocumento,
  aplicarMaskPlaca,
  aplicarMaskTelefone,
  somenteDigitos,
  TAMANHO_CNPJ,
  TAMANHO_CPF,
} from './masks'

export function formatarMoeda(valor) {
  return new Intl.NumberFormat(
    'pt-BR',
    {
      style: 'currency',
      currency: 'BRL'
    }
  ).format(valor)
}

export function formatarTelefone(telefone) {
  if (!telefone) return ''

  const tamanho = somenteDigitos(telefone).length

  if (tamanho !== 10 && tamanho !== 11) return telefone

  return aplicarMaskTelefone(telefone)
}

export function formatarDocumento(documento) {
  if (!documento) return ''

  const tamanho = somenteDigitos(documento).length

  if (tamanho !== TAMANHO_CPF && tamanho !== TAMANHO_CNPJ) return documento

  return aplicarMaskDocumento(documento)
}

export function formatarData(data) {
  if (!data) return ''

  const somenteData = /^\d{4}-\d{2}-\d{2}$/.test(String(data))

  const instancia = somenteData
    ? new Date(`${data}T00:00:00`)
    : new Date(data)

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(instancia)
}

export function obterIniciais(texto) {
  if (!texto) return ''

  const palavras = texto.trim().split(/\s+/)

  if (palavras.length === 1) {
    return palavras[0].slice(0, 2).toUpperCase()
  }

  return (palavras[0][0] + palavras[palavras.length - 1][0]).toUpperCase()
}

export function formatarPlaca(placa) {
  if (!placa) return ''

  return aplicarMaskPlaca(placa)
}

export function formatarVeiculo(veiculo) {
  if (!veiculo) return ''

  const descricao = `${veiculo.marca} ${veiculo.modelo}`

  return veiculo.ano ? `${descricao} (${veiculo.ano})` : descricao
}
