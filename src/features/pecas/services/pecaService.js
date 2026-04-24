import api from '@/lib/api'
 
export const pecaService = {
  listar:      ()         => api.get('/pecas'),
  buscarPorId: (id)       => api.get(`/pecas/${id}`),
  criar:       (dados)    => api.post('/pecas', dados),
  atualizar:   (id, dados)=> api.put(`/pecas/${id}`, dados),
  inativar:    (id)       => api.patch(`/pecas/inativar/${id}`),
  reativar:    (id)       => api.patch(`/pecas/reativar/${id}`),
}