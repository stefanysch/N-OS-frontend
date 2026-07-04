import api from '@/lib/api'

async function listar() {
  const resposta = await api.get('/servicos')
  return resposta.data
}

async function buscarPorId(id) {
  const resposta = await api.get(`/servicos/${id}`)
  return resposta.data
}

async function criar(dados) {
  const resposta = await api.post('/servicos', dados)
  return resposta.data
}

async function atualizar(id, dados) {
  const resposta = await api.put(`/servicos/${id}`, dados)
  return resposta.data
}

async function inativar(id) {
  const resposta = await api.patch(`/servicos/inativar/${id}`)
  return resposta.data
}

async function reativar(id) {
  const resposta = await api.patch(`/servicos/reativar/${id}`)
  return resposta.data
}

export const servicoService = {
  listar,
  buscarPorId,
  criar,
  atualizar,
  inativar,
  reativar
}