import { placaValida } from '@/utils/validators'

export const VEICULO_FORMULARIO_VAZIO = {
  clienteId: '',
  placa: '',
  marca: '',
  modelo: '',
  ano: '',
  cor: '',
  chassi: '',
}

export function validarVeiculo(formulario, { exigirCliente }) {
  const erros = {}

  if (exigirCliente && !formulario.clienteId)
    erros.clienteId = 'Selecione um cliente'

  if (!formulario.placa.trim())
    erros.placa = 'Placa é obrigatória'
  else if (!placaValida(formulario.placa))
    erros.placa = 'Placa inválida. Use ABC-1234 ou ABC1D23'

  if (!formulario.marca.trim())
    erros.marca = 'Marca é obrigatória'

  if (!formulario.modelo.trim())
    erros.modelo = 'Modelo é obrigatório'
  const anoNum = Number(formulario.ano)
  const anoAtual = new Date().getFullYear()

  if (
    formulario.ano &&
    (anoNum < 1900 || anoNum > anoAtual + 1)
  ) {
    erros.ano = `Ano inválido (1900 – ${anoAtual + 1})`
  }

  return erros
}

export function montarPayloadVeiculo(formulario) {
  return {
    placa: formulario.placa.trim().toUpperCase(),
    marca: formulario.marca.trim(),
    modelo: formulario.modelo.trim(),
    ano: formulario.ano ? Number(formulario.ano) : null,
    cor: formulario.cor.trim() || null,
    chassi: formulario.chassi.trim() || null,
  }
}
