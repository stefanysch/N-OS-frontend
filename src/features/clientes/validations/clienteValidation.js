import {
  aplicarMaskCEP,
  aplicarMaskDocumento,
  aplicarMaskTelefone,
  inferirTipoDocumento,
  somenteDigitos,
  TIPO_CNPJ,
  TIPO_CPF,
} from '@/utils/masks'
import {
  documentoValido,
  emailValido,
  telefoneValido,
} from '@/utils/validators'

export const TIPO_DOCUMENTO = [
  { label: 'CPF', value: TIPO_CPF },
  { label: 'CNPJ', value: TIPO_CNPJ },
]

export const CLIENTE_FORMULARIO_VAZIO = {
  nome: '',
  telefone: '',
  email: '',
  tipoDocumento: TIPO_CPF,
  documento: '',
  cep: '',
  logradouro: '',
  numero: '',
  complemento: '',
  bairro: '',
  cidade: '',
  estado: '',
}

// a API devolve documento e CEP só com dígitos, e não devolve o tipo do
// documento: infere pelo tamanho e aplica as máscaras ao carregar um cliente
// existente pra edição, igual ao que o usuário vê ao digitar.
export function montarFormularioCliente(dados) {
  const tipoDocumento = inferirTipoDocumento(dados.documento)

  return {
    nome: dados.nome ?? '',
    telefone: aplicarMaskTelefone(dados.telefone),
    email: dados.email ?? '',
    tipoDocumento,
    documento: aplicarMaskDocumento(dados.documento, tipoDocumento),
    cep: aplicarMaskCEP(dados.cep),
    logradouro: dados.logradouro ?? '',
    numero: dados.numero ?? '',
    complemento: dados.complemento ?? '',
    bairro: dados.bairro ?? '',
    cidade: dados.cidade ?? '',
    estado: dados.estado ?? '',
  }
}

export function validarCliente(formulario) {
  const erros = {}

  if (!formulario.nome.trim())
    erros.nome = 'Nome é obrigatório'

  if (!formulario.telefone.trim())
    erros.telefone = 'Telefone é obrigatório'
  else if (!telefoneValido(formulario.telefone))
    erros.telefone = 'Telefone inválido. Informe DDD e número'

  if (formulario.email.trim() && !emailValido(formulario.email))
    erros.email = 'E-mail inválido'

  if (!formulario.documento.trim()) {
    erros.documento = 'Documento é obrigatório'
  } else if (!documentoValido(formulario.documento, formulario.tipoDocumento)) {
    erros.documento =
      formulario.tipoDocumento === TIPO_CNPJ ? 'CNPJ inválido' : 'CPF inválido'
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
    telefone: somenteDigitos(formulario.telefone),
    email: formulario.email.trim() || null,
    tipoDocumento: formulario.tipoDocumento,
    documento: somenteDigitos(formulario.documento),
    cep: formulario.cep.trim() || null,
    logradouro: formulario.logradouro.trim() || null,
    numero: formulario.numero.trim() || null,
    complemento: formulario.complemento.trim() || null,
    bairro: formulario.bairro.trim() || null,
    cidade: formulario.cidade.trim() || null,
    estado: formulario.estado.trim() || null,
  }
}
