export function somenteDigitos(valor) {
  return String(valor ?? '').replace(/\D/g, '')
}

/**
 * aplica um padrão aos dígitos, onde `#` é um dígito e o resto é literal.
 * para quando acabam os dígitos, então serve pra máscara parcial (digitando).
 *   aplicarPadrao('5299', '###.###.###-##') -> '529.9'
 */
function aplicarPadrao(valor, padrao) {
  const digitos = somenteDigitos(valor)
  let resultado = ''
  let usados = 0

  for (const caractere of padrao) {
    if (usados >= digitos.length) break

    if (caractere === '#') {
      resultado += digitos[usados]
      usados += 1
    } else {
      resultado += caractere
    }
  }

  return resultado
}

const PADRAO_CPF = '###.###.###-##'
const PADRAO_CNPJ = '##.###.###/####-##'

export const TAMANHO_CPF = 11
export const TAMANHO_CNPJ = 14

// tipoDocumento da API: 1 = CPF, 2 = CNPJ.
export const TIPO_CPF = 1
export const TIPO_CNPJ = 2

/** infere o tipo pelo tamanho: até 11 dígitos é CPF, acima disso CNPJ. */
export function inferirTipoDocumento(valor) {
  return somenteDigitos(valor).length > TAMANHO_CPF ? TIPO_CNPJ : TIPO_CPF
}

/**
 * máscara de CPF ou CNPJ. com `tipoDocumento` (1 ou 2) usa o tipo escolhido;
 * sem ele, decide pelo tamanho: até 11 dígitos é CPF, acima disso CNPJ.
 */
export function aplicarMaskDocumento(valor, tipoDocumento = inferirTipoDocumento(valor)) {
  return aplicarPadrao(valor, tipoDocumento === TIPO_CNPJ ? PADRAO_CNPJ : PADRAO_CPF)
}

/** 10 dígitos (fixo) usa (00) 0000-0000; 11 (celular) usa (00) 00000-0000. */
export function aplicarMaskTelefone(valor) {
  return aplicarPadrao(
    valor,
    somenteDigitos(valor).length <= 10 ? '(##) ####-####' : '(##) #####-####'
  )
}

/**
 * placa antiga (ABC-1234) leva hífen; Mercosul (ABC1D23) não.
 * o 5º caractere decide: dígito é padrão antigo, letra é Mercosul.
 */
export function aplicarMaskPlaca(valor) {
  const placa = String(valor ?? '')
    .replace(/[^a-zA-Z0-9]/g, '')
    .toUpperCase()
    .slice(0, 7)

  if (placa.length <= 3 || /[A-Z]/.test(placa[4] ?? '')) return placa

  return `${placa.slice(0, 3)}-${placa.slice(3)}`
}

export function aplicarMaskCEP(valor) {
  return aplicarPadrao(valor, '#####-###')
}
