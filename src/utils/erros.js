export function obterMensagemErro(data, mensagemPadrao = 'Ocorreu um erro.') {
  if (typeof data === 'string') return data
  if (data?.mensagem) return data.mensagem
  if (data?.errors) return Object.values(data.errors).flat().join('\n')
  if (data?.title) return data.title
  return mensagemPadrao
}
