import api from '@/lib/api'

async function listar() {
  const resposta = await api.get('/clientes')
  return resposta.data
}

async function buscarPorId(id) {
  const resposta = await api.get(`/clientes/${id}`)
  return resposta.data
}

async function criar(dados) {
  const resposta = await api.post('/clientes', dados)
  return resposta.data
}

async function atualizar(id, dados) {
  const resposta = await api.put(`/clientes/${id}`, dados)
  return resposta.data
}

async function inativar(id) {
  const resposta = await api.patch(`/clientes/${id}/inativar`)
  return resposta.data
}

async function reativar(id) {
  const resposta = await api.patch(`/clientes/${id}/reativar`)
  return resposta.data
}

export const clienteService = {
  listar,
  buscarPorId,
  criar,
  atualizar,
  inativar,
  reativar
}