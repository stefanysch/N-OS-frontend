import api from '@/lib/api'

async function obter() {
  const resposta = await api.get('/empresa')
  return resposta.data
}

async function atualizar(dados) {
  const resposta = await api.put('/empresa', dados)
  return resposta.data
}

export const empresaService = {
  obter,
  atualizar,
}
