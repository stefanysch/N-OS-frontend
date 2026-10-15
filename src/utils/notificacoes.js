const ouvintes = new Set()

export function inscreverNotificacoes(ouvinte) {
  ouvintes.add(ouvinte)
  return () => ouvintes.delete(ouvinte)
}

export function notificarSucesso(mensagem) {
  ouvintes.forEach((ouvinte) => ouvinte(mensagem))
}
