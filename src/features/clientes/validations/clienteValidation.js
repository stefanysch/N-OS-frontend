export const TIPO_DOCUMENTO = [
  { label: 'CPF', value: 1 },
  { label: 'CNPJ', value: 2 },
]

export const CLIENTE_FORMULARIO_VAZIO = {
  nome: '',
  telefone: '',
  email: '',
  tipoDocumento: 1,
  documento: '',
  cep: '',
  logradouro: '',
  numero: '',
  complemento: '',
  bairro: '',
  cidade: '',
  estado: '',
}

// a API não devolve o tipo do documento, só o número — infere pela
// quantidade de dígitos (11 = CPF, 14 = CNPJ) ao carregar um cliente
// existente pra edição.
export function inferirTipoDocumento(documento) {
  const digitos = (documento ?? '').replace(/\D/g, '')
  return digitos.length === 14 ? 2 : 1
}

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

  // endereço é opcional como um todo, mas se algum campo foi preenchido
  // os outros passam a ser exigidos. 
  const enderecoIniciado =
    formulario.cep.trim() ||
    formulario.logradouro.trim() ||
    formulario.numero.trim() ||
    formulario.bairro.trim() ||
    formulario.cidade.trim() ||
    formulario.estado.trim()

  if (enderecoIniciado) {
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
  }

  return erros
}

export function montarPayloadCliente(formulario) {
  return {
    nome: formulario.nome.trim(),
    telefone: formulario.telefone.trim(),
    email: formulario.email.trim() || null,
    tipoDocumento: formulario.tipoDocumento,
    documento: formulario.documento.trim(),
    cep: formulario.cep.trim() || null,
    logradouro: formulario.logradouro.trim() || null,
    numero: formulario.numero.trim() || null,
    complemento: formulario.complemento.trim() || null,
    bairro: formulario.bairro.trim() || null,
    cidade: formulario.cidade.trim() || null,
    estado: formulario.estado.trim() || null,
  }
}
