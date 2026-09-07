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

  const numeros = telefone.replace(/\D/g, '')

  if (numeros.length === 11) {
    return numeros.replace(
      /^(\d{2})(\d{5})(\d{4})$/,
      '($1) $2-$3'
    )
  }

  if (numeros.length === 10) {
    return numeros.replace(
      /^(\d{2})(\d{4})(\d{4})$/,
      '($1) $2-$3'
    )
  }

  return telefone
}

export function formatarDocumento(documento, tipoDocumento) {
  if (!documento) return ''

  const numeros = documento.replace(/\D/g, '')

  if (
    tipoDocumento === 'CPF' ||
    tipoDocumento === 1 ||
    numeros.length === 11
  ) {
    return numeros.replace(
      /^(\d{3})(\d{3})(\d{3})(\d{2})$/,
      '$1.$2.$3-$4'
    )
  }

  if (
    tipoDocumento === 'CNPJ' ||
    tipoDocumento === 2 ||
    numeros.length === 14
  ) {
    return numeros.replace(
      /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
      '$1.$2.$3/$4-$5'
    )
  }

  return documento
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

  const valor = placa
    .replace(/[^a-zA-Z0-9]/g, '')
    .toUpperCase()

  if (valor.length === 7) {
    return valor.replace(
      /^([A-Z]{3})(\d{4})$/,
      '$1-$2'
    )
  }

  return placa.toUpperCase()
}