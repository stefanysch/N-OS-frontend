import api from '@/lib/api'

async function obter() {
  const resposta = await api.get('/perfil')
  return resposta.data
}

async function atualizar(dados) {
  const resposta = await api.put('/perfil', dados)
  return resposta.data
}

async function alterarSenha(dados) {
  const resposta = await api.put('/perfil/senha', dados)
  return resposta.data
}

export const perfilService = {
  obter,
  atualizar,
  alterarSenha,
}
