import api from '@/lib/api'
 
export const servicoService = {
  listar:      ()         => api.get('/servicos'),
  buscarPorId: (id)       => api.get(`/servicos/${id}`),
  criar:       (dados)    => api.post('/servicos', dados),
  atualizar:   (id, dados)=> api.put(`/servicos/${id}`, dados),
  inativar:    (id)       => api.patch(`/servicos/inativar/${id}`),
  reativar:    (id)       => api.patch(`/servicos/reativar/${id}`),
}