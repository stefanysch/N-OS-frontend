const CHAVE = 'nos-usuario'
const EVENTO = 'nos:usuario-atualizado'

export function lerUsuarioLocal() {
  try {
    const bruto = localStorage.getItem(CHAVE)
    return bruto ? JSON.parse(bruto) : null
  } catch {
    return null
  }
}

export function salvarUsuarioLocal(usuario) {
  try {
    localStorage.setItem(CHAVE, JSON.stringify(usuario))
  } catch {
    // localStorage indisponível — segue só com o estado em memória
  }

  window.dispatchEvent(new CustomEvent(EVENTO, { detail: usuario }))
}

export function removerUsuarioLocal() {
  try {
    localStorage.removeItem(CHAVE)
  } catch {
  }
}

export function aoAtualizarUsuarioLocal(callback) {
  function ouvinte(evento) {
    callback(evento.detail)
  }

  window.addEventListener(EVENTO, ouvinte)

  return () => window.removeEventListener(EVENTO, ouvinte)
}
