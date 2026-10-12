import api from '@/lib/api'

async function login(credenciais) {
  const resposta = await api.post('/auth/login', credenciais)
  return resposta.data
}

async function logout() {
  try {
    await api.post('/auth/logout')
  } catch {
    // sem rede ou API fora do ar
  }
}

async function registrar(dados) {
  const resposta = await api.post('/auth/registrar', dados)
  return resposta.data
}

export const authService = {
  login,
  logout,
  registrar,
}
