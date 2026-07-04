import api from '@/lib/api'

async function listar() {
  const resposta = await api.get('/pecas')
  return resposta.data
}

async function buscarPorId(id) {
  const resposta = await api.get(`/pecas/${id}`)
  return resposta.data
}

async function criar(dados) {
  const resposta = await api.post('/pecas', dados)
  return resposta.data
}

async function atualizar(id, dados) {
  const resposta = await api.put(`/pecas/${id}`, dados)
  return resposta.data
}

async function inativar(id) {
  const resposta = await api.patch(`/pecas/inativar/${id}`)
  return resposta.data
}

async function reativar(id) {
  const resposta = await api.patch(`/pecas/reativar/${id}`)
  return resposta.data
}

export const pecaService = {
  listar,
  buscarPorId,
  criar,
  atualizar,
  inativar,
  reativar
}