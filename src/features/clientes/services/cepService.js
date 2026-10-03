import { somenteDigitos } from '@/utils/masks'

async function buscarEndereco(cep) {
  const digitos = somenteDigitos(cep)

  if (digitos.length !== 8) {
    return null
  }

  const resposta = await fetch(
    `https://brasilapi.com.br/api/cep/v1/${digitos}`
  )

  if (!resposta.ok) {
    return null
  }

  const dados = await resposta.json()

  return {
    logradouro: dados.street ?? '',
    bairro: dados.neighborhood ?? '',
    cidade: dados.city ?? '',
    estado: dados.state ?? '',
  }
}

export const cepService = {
  buscarEndereco,
}
