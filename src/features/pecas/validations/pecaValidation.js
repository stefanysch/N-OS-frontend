export const PECA_FORMULARIO_VAZIO = {
  nome: '',
  descricao: '',
  valor: '',
}

export function validarPeca(formulario) {
  const erros = {}

  if (!formulario.nome.trim())
    erros.nome = 'Nome é obrigatório'
  if (formulario.valor === '' || !(Number(formulario.valor) > 0))
    erros.valor = 'Informe um valor maior que zero'

  return erros
}

export function montarPayloadPeca(formulario) {
  return {
    nome: formulario.nome.trim(),
    descricao: formulario.descricao.trim() || null,
    valor: Number(formulario.valor),
  }
}
