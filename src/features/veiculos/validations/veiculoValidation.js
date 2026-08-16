export function validarVeiculo(formulario, { modoWizard }) {
  const erros = {}

  if (!modoWizard && !formulario.clienteId)
    erros.clienteId = 'Selecione um cliente'

  if (!formulario.placa.trim())
    erros.placa = 'Placa é obrigatória'

  if (!formulario.marca.trim())
    erros.marca = 'Marca é obrigatória'

  if (!formulario.modelo.trim())
    erros.modelo = 'Modelo é obrigatório'

  if (!formulario.ano)
    erros.ano = 'Ano é obrigatório'

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

export function montarPayloadVeiculo(formulario, { modoWizard, clienteWizard }) {
  return {
    clienteId: modoWizard
      ? clienteWizard.id
      : Number(formulario.clienteId),
    placa: formulario.placa.trim().toUpperCase(),
    marca: formulario.marca.trim(),
    modelo: formulario.modelo.trim(),
    ano: Number(formulario.ano),
    cor: formulario.cor.trim() || null,
    chassi: formulario.chassi.trim() || null,
  }
}
