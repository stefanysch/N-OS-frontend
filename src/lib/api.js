import axios from 'axios'

import { removerUsuarioLocal } from '@/utils/usuarioLocal'

// a sessão fica em cookies HttpOnly: o JavaScript não lê nem guarda token algum
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:5041/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

try {
  localStorage.removeItem('nos-token')
} catch {
}

const ROTAS_SEM_RENOVACAO = ['/auth/login', '/auth/refresh', '/auth/logout']

// várias chamadas podem receber 401 juntas: só uma renova, as outras esperam
let renovacaoEmAndamento = null

function renovarSessao() {
  renovacaoEmAndamento ??= api
    .post('/auth/refresh')
    .finally(() => {
      renovacaoEmAndamento = null
    })

  return renovacaoEmAndamento
}

function encerrarSessaoLocal() {
  removerUsuarioLocal()

  if (window.location.pathname !== '/login') {
    window.location.href = '/login'
  }
}

api.interceptors.response.use(
  (resposta) => resposta,
  async (erro) => {
    const { config, response } = erro

    if (response?.status !== 401 || !config) {
      return Promise.reject(erro)
    }

    const rotaDeAuth = ROTAS_SEM_RENOVACAO.some((rota) => config.url?.startsWith(rota))

    if (rotaDeAuth) {
      return Promise.reject(erro)
    }

    // já tentou renovar e repetir esta chamada: a sessão acabou
    if (config._jaRenovou) {
      encerrarSessaoLocal()
      return Promise.reject(erro)
    }

    config._jaRenovou = true

    try {
      await renovarSessao()
    } catch {
      // outra aba pode ter renovado primeiro (o refresh token é de uso único e os
      // cookies são compartilhados): tenta a chamada mais uma vez antes de desistir
    }

    return api(config)
  }
)

export default api
