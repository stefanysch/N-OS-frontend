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