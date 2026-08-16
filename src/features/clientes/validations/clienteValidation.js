export function validarCliente(formulario) {
  const erros = {}

  if (!formulario.nome.trim())
    erros.nome = 'Nome é obrigatório'

  if (!formulario.telefone.trim())
    erros.telefone = 'Telefone é obrigatório'

  if (!formulario.documento.trim())
    erros.documento = 'Documento é obrigatório'

  const digitos = formulario.documento.replace(/\D/g, '')

  if (
    formulario.tipoDocumento === 1 &&
    digitos.length > 0 &&
    digitos.length !== 11
  ) {
    erros.documento = 'CPF inválido'
  }

  if (
    formulario.tipoDocumento === 2 &&
    digitos.length > 0 &&
    digitos.length !== 14
  ) {
    erros.documento = 'CNPJ inválido'
  }

  if (!formulario.cep.trim())
    erros.cep = 'CEP é obrigatório'

  if (!formulario.logradouro.trim())
    erros.logradouro = 'Logradouro é obrigatório'

  if (!formulario.numero.trim())
    erros.numero = 'Número é obrigatório'

  if (!formulario.bairro.trim())
    erros.bairro = 'Bairro é obrigatório'

  if (!formulario.cidade.trim())
    erros.cidade = 'Cidade é obrigatória'

  if (!formulario.estado.trim())
    erros.estado = 'UF é obrigatória'

  return erros
}

export function montarPayloadCliente(formulario) {
  return {
    nome: formulario.nome.trim(),
    telefone: formulario.telefone.trim(),
    email: formulario.email.trim() || null,
    tipoDocumento: formulario.tipoDocumento,
    documento: formulario.documento.trim(),
    cep: formulario.cep.trim(),
    logradouro: formulario.logradouro.trim(),
    numero: formulario.numero.trim(),
    complemento: formulario.complemento.trim() || null,
    bairro: formulario.bairro.trim(),
    cidade: formulario.cidade.trim(),
    estado: formulario.estado.trim(),
  }
}
