import {
  somenteDigitos,
  TAMANHO_CNPJ,
  TAMANHO_CPF,
  TIPO_CNPJ,
  TIPO_CPF,
} from './masks'

// mesmo algoritmo do backend (Documento.Valido).
// CPF e CNPJ só diferem no tamanho e no ciclo dos pesos:
// CPF pesa 2, 3, 4... sem repetir; CNPJ repete o ciclo 2 a 9.
// os pesos são contados da direita para a esquerda.

const CICLO_CPF = 12
const CICLO_CNPJ = 9

function digitoVerificador(digitos, ciclo) {
  const soma = [...digitos]
    .reverse()
    .reduce((acc, digito, i) => acc + Number(digito) * ((i % (ciclo - 1)) + 2), 0)

  const resto = soma % 11

  return resto < 2 ? 0 : 11 - resto
}

/**
 * valida CPF ou CNPJ (com ou sem máscara). com `tipoDocumento` (1 ou 2)
 * exige o tamanho daquele tipo; sem ele, o tamanho decide qual é.
 */
export function documentoValido(valor, tipoDocumento) {
  const digitos = somenteDigitos(valor)

  if (/^(\d)\1*$/.test(digitos)) return false

  let ciclo = 0

  if (digitos.length === TAMANHO_CPF && tipoDocumento !== TIPO_CNPJ) ciclo = CICLO_CPF
  if (digitos.length === TAMANHO_CNPJ && tipoDocumento !== TIPO_CPF) ciclo = CICLO_CNPJ

  if (!ciclo) return false

  const base = digitos.length - 2

  return (
    Number(digitos[base]) === digitoVerificador(digitos.slice(0, base), ciclo) &&
    Number(digitos[base + 1]) === digitoVerificador(digitos.slice(0, base + 1), ciclo)
  )
}

/** padrão antigo (ABC-1234) ou Mercosul (ABC1D23), com ou sem hífen. */
export function placaValida(valor) {
  return /^[A-Za-z]{3}-?\d[A-Za-z0-9]\d{2}$/.test(String(valor ?? '').trim())
}

/** 10 dígitos (fixo) ou 11 (celular), com DDD. */
export function telefoneValido(valor) {
  const digitos = somenteDigitos(valor)

  return digitos.length === 10 || digitos.length === 11
}

export function emailValido(valor) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(valor ?? '').trim())
}
