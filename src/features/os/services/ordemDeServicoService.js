import api from '@/lib/api'

async function listar() {
  const resposta = await api.get('/ordens-servico')
  return resposta.data
}

async function buscarPorId(id) {
  const resposta = await api.get(`/ordens-servico/${id}`)
  return resposta.data
}

async function criar(dados) {
  const resposta = await api.post('/ordens-servico', dados)
  return resposta.data
}

async function atualizar(id, dados) {
  const resposta = await api.put(`/ordens-servico/${id}`, dados)
  return resposta.data
}

async function alterarStatus(id, status) {
  const resposta = await api.patch(`/ordens-servico/${id}/status`, { status })
  return resposta.data
}

async function removerItem(id, itemId) {
  const resposta = await api.delete(`/ordens-servico/${id}/itens/${itemId}`)
  return resposta.data
}

async function inativar(id) {
  const resposta = await api.patch(`/ordens-servico/inativar/${id}`)
  return resposta.data
}

async function reativar(id) {
  const resposta = await api.patch(`/ordens-servico/reativar/${id}`)
  return resposta.data
}

export const ordemDeServicoService = {
  listar,
  buscarPorId,
  criar,
  atualizar,
  alterarStatus,
  removerItem,
  inativar,
  reativar,
}