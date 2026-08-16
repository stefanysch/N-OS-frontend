function validarItensEDesconto({ itens, desconto, subtotal }) {
  const erros = {}

  if (itens.length === 0)
    erros.itens = 'Adicione ao menos um item'

  const descontoNumerico = Number(desconto || 0)

  if (descontoNumerico < 0)
    erros.desconto = 'O desconto não pode ser negativo.'

  if (descontoNumerico > subtotal)
    erros.desconto = 'O desconto não pode ser maior que o subtotal.'

  itens.forEach((item, index) => {
    if (item.tipo === 'peca' && !item.pecaId) {
      erros[`item_${index}_item`] = 'Selecione uma peça.'
    }

    if (item.tipo === 'servico' && !item.servicoId) {
      erros[`item_${index}_item`] = 'Selecione um serviço.'
    }

    if (!item.quantidade || Number(item.quantidade) < 1) {
      erros[`item_${index}_qtd`] = 'Qtd. inválida'
    }
  })

  return erros
}

function montarItensPayload(itens) {
  return itens.map((item) => ({
    pecaId: item.tipo === 'peca' ? Number(item.pecaId) : null,
    servicoId: item.tipo === 'servico' ? Number(item.servicoId) : null,
    quantidade: Number(item.quantidade),
  }))
}

export function validarOrdemDeServico({
  clienteId,
  veiculoId,
  descricaoProblema,
  itens,
  desconto,
  subtotal,
}) {
  const erros = {}

  if (!clienteId)
    erros.clienteId = 'Selecione um cliente'

  if (!veiculoId)
    erros.veiculoId = 'Selecione um veículo'

  if (!descricaoProblema.trim())
    erros.descricaoProblema = 'Descreva o problema'

  return {
    ...erros,
    ...validarItensEDesconto({ itens, desconto, subtotal }),
  }
}

export function montarPayloadOrdemDeServico({
  veiculoId,
  status,
  descricaoProblema,
  observacoes,
  desconto,
  itens,
}) {
  return {
    veiculoId: Number(veiculoId),

    status: Number(status),

    descricaoProblema: descricaoProblema.trim(),

    observacoes: observacoes.trim() || null,

    desconto: Number(desconto || 0),

    itens: montarItensPayload(itens),
  }
}

export function validarEdicaoOrdemDeServico({
  descricaoProblema,
  itensExistentes,
  itensNovos,
  desconto,
  subtotal,
}) {
  const erros = {}

  if (!descricaoProblema.trim())
    erros.descricaoProblema = 'Descreva o problema'

  if (itensExistentes.length + itensNovos.length === 0)
    erros.itens = 'Adicione ao menos um item'

  const descontoNumerico = Number(desconto || 0)

  if (descontoNumerico < 0)
    erros.desconto = 'O desconto não pode ser negativo.'

  if (descontoNumerico > subtotal)
    erros.desconto = 'O desconto não pode ser maior que o subtotal.'

  itensNovos.forEach((item, index) => {
    if (item.tipo === 'peca' && !item.pecaId) {
      erros[`item_${index}_item`] = 'Selecione uma peça.'
    }

    if (item.tipo === 'servico' && !item.servicoId) {
      erros[`item_${index}_item`] = 'Selecione um serviço.'
    }

    if (!item.quantidade || Number(item.quantidade) < 1) {
      erros[`item_${index}_qtd`] = 'Qtd. inválida'
    }
  })

  return erros
}

export function montarPayloadEdicaoOrdemDeServico({
  descricaoProblema,
  observacoes,
  desconto,
  itensNovos,
}) {
  return {
    descricaoProblema: descricaoProblema.trim(),

    observacoes: observacoes.trim() || null,

    desconto: Number(desconto || 0),

    itens: montarItensPayload(itensNovos),
  }
}
