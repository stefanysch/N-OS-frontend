export const SERVICO_FORMULARIO_VAZIO = {
  nome: '',
  descricao: '',
  valor: '',
}

export function validarServico(formulario) {
  const erros = {}

  if (!formulario.nome.trim())
    erros.nome = 'Nome é obrigatório'

  if (formulario.valor === '' || !(Number(formulario.valor) > 0))
    erros.valor = 'Informe um valor maior que zero'

  return erros
}

export function montarPayloadServico(formulario) {
  return {
    nome: formulario.nome.trim(),
    descricao: formulario.descricao.trim() || null,
    valor: Number(formulario.valor),
  }
}