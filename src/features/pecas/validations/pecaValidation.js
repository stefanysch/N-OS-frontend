export function validarPeca(formulario) {

  const erros = {}

  if (!formulario.nome?.trim()) {
    erros.nome = 'Nome é obrigatório'
  }

  if (
    formulario.valor === '' ||
    formulario.valor === null ||
    Number(formulario.valor) < 0
  ) {
    erros.valor = 'Informe um valor válido'
  }

  return erros
}

export function montarPayloadPeca(formulario) {
  return {
    nome: formulario.nome.trim(),
    descricao: formulario.descricao?.trim() || '',
    valor: Number(formulario.valor)
  }
}