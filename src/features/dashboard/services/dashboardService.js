import api from '@/lib/api'

async function obterResumo() {
  const resposta = await api.get('/dashboard/resumo')
  return resposta.data
}

async function obterFaturamento(de, ate) {
  const resposta = await api.get('/dashboard/faturamento', {
    params: { de, ate },
  })
  return resposta.data
}

export const dashboardService = {
  obterResumo,
  obterFaturamento,
}
