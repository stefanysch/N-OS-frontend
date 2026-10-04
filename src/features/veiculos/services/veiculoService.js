import api from '@/lib/api'

async function listar() {
  const resposta = await api.get('/veiculos')
  return resposta.data
}

async function listarPaginado(params) {
  const resposta = await api.get('/veiculos/paginado', { params })
  return resposta.data
}

async function listarPorCliente(clienteId) {
  const resposta = await api.get(`/veiculos/cliente/${clienteId}`)
  return resposta.data
}

async function buscarPorId(id) {
  const resposta = await api.get(`/veiculos/${id}`)
  return resposta.data
}

async function criar(dados) {
  const resposta = await api.post('/veiculos', dados)
  return resposta.data
}

async function atualizar(id, dados) {
  const resposta = await api.put(`/veiculos/${id}`, dados)
  return resposta.data
}

async function inativar(id) {
  const resposta = await api.patch(`/veiculos/inativar/${id}`)
  return resposta.data
}

async function reativar(id) {
  const resposta = await api.patch(`/veiculos/reativar/${id}`)
  return resposta.data
}

export const veiculoService = {
  listar,
  listarPaginado,
  listarPorCliente,
  buscarPorId,
  criar,
  atualizar,
  inativar,
  reativar,
}